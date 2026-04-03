/**
 * push_to_supabase.js
 * -------------------
 * Syncs your local PostgreSQL database to Supabase.
 * Run: npm run sync:supabase
 *
 * ✅ Auto-generates schema FROM your live local DB (no SQL file needed)
 * ✅ Migrates all data
 * ✅ Resets sequences for auto-increment
 */

const { Pool } = require('pg');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const LOCAL_DB_URL  = 'postgresql://postgres:2301@localhost:5432/unifiedtransform_db';
const SUPABASE_URL  = 'postgresql://postgres:1046402103As@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
// ─────────────────────────────────────────────────────────────────────────────

const localPool    = new Pool({ connectionString: LOCAL_DB_URL });
const supabasePool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Map local pg data_type to a safe Supabase column type
function pgType(col) {
  const t = col.data_type;
  const max = col.character_maximum_length;
  if (t === 'character varying') return max ? `VARCHAR(${max})` : 'TEXT';
  if (t === 'timestamp without time zone' || t === 'timestamp with time zone') return 'TIMESTAMP';
  if (t === 'integer')     return 'INTEGER';
  if (t === 'bigint')      return 'BIGINT';
  if (t === 'smallint')    return 'SMALLINT';
  if (t === 'boolean')     return 'BOOLEAN';
  if (t === 'numeric' || t === 'decimal') return 'NUMERIC';
  if (t === 'real' || t === 'double precision') return 'DOUBLE PRECISION';
  if (t === 'date')        return 'DATE';
  if (t === 'time without time zone' || t === 'time with time zone') return 'TIME';
  if (t === 'json')        return 'JSON';
  if (t === 'jsonb')       return 'JSONB';
  if (t === 'text')        return 'TEXT';
  if (t === 'USER-DEFINED') return 'TEXT'; // enums become text
  return 'TEXT';  // safe fallback
}

async function run() {
  console.log('\n🚀 Starting Local → Supabase Sync...\n');

  try {
    await localPool.query('SELECT 1');
    console.log('✅ Connected to local database');
    await supabasePool.query('SELECT 1');
    console.log('✅ Connected to Supabase');

    // ─── Step 1: Get ordered table list (by foreign key dependencies) ───────
    // We use pg_tables and then respect FK order. Simple approach: try inserting
    // all with FK checks disabled.
    const tablesRes = await localPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tables = tablesRes.rows.map(r => r.table_name);

    // ─── Step 2: Reset Supabase schema ──────────────────────────────────────
    console.log('\n🗑️  Resetting Supabase public schema...');
    await supabasePool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('✅ Schema cleared\n');

    // ─── Step 3: Re-create tables from live local schema ────────────────────
    console.log('📐 Creating tables from live local schema...\n');

    // Get all columns with type info
    const colsRes = await localPool.query(`
      SELECT table_name, column_name, data_type, character_maximum_length,
             is_nullable, column_default, ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Group by table
    const tableColumns = {};
    for (const row of colsRes.rows) {
      if (!tableColumns[row.table_name]) tableColumns[row.table_name] = [];
      tableColumns[row.table_name].push(row);
    }

    // Create each table
    await supabasePool.query("SET session_replication_role = 'replica';");

    for (const table of tables) {
      const cols = tableColumns[table];
      if (!cols || cols.length === 0) continue;

      const colDefs = cols.map(col => {
        let def = `"${col.column_name}" ${pgType(col)}`;
        // Handle serial/auto-increment
        if (col.column_default && col.column_default.startsWith('nextval(')) {
          def = `"${col.column_name}" SERIAL`;
          if (col.column_name === 'id') def += ' PRIMARY KEY';
          return def;
        }
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default && !col.column_default.startsWith('nextval(')) {
          def += ` DEFAULT ${col.column_default}`;
        }
        return def;
      });

      const createSQL = `CREATE TABLE IF NOT EXISTS "${table}" (\n  ${colDefs.join(',\n  ')}\n)`;
      try {
        await supabasePool.query(createSQL);
        console.log(`  📋 Created table: ${table}`);
      } catch (e) {
        console.log(`  ⚠️  Error creating ${table}: ${e.message.split('\n')[0]}`);
      }
    }
    console.log('');

    // ─── Step 4: Migrate data ───────────────────────────────────────────────
    console.log('📦 Migrating data...\n');
    let totalRows = 0;

    for (const table of tables) {
      const data = await localPool.query(`SELECT * FROM "${table}"`);
      const count = data.rows.length;

      if (count === 0) {
        console.log(`  ⬜ ${table} — empty`);
        continue;
      }

      const cols = Object.keys(data.rows[0]);
      const colNames = cols.map(c => `"${c}"`).join(', ');
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const insertSQL = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let success = 0, failed = 0;
      for (const row of data.rows) {
        try {
          await supabasePool.query(insertSQL, cols.map(c => row[c]));
          success++;
        } catch (e) {
          failed++;
          if (failed === 1) console.log(`    ⚠️  ${table} insert error: ${e.message.split('\n')[0]}`);
        }
      }

      // Reset sequence
      try {
        await supabasePool.query(`
          SELECT setval(
            pg_get_serial_sequence('"${table}"', 'id'),
            COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1
          )
        `);
      } catch (_) {}

      totalRows += success;
      console.log(`  ✅ ${table} — ${success}/${count} rows${failed > 0 ? ` (⚠️ ${failed} failed)` : ''}`);
    }

    await supabasePool.query("SET session_replication_role = 'origin';");

    console.log(`\n🎉 Sync Complete! ${totalRows} total rows pushed to Supabase.`);
    console.log('🌐 Your production database is now up-to-date!\n');

  } catch (err) {
    console.error('\n❌ Sync failed:', err.message);
    process.exit(1);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

run();
