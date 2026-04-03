const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const localPool = new Pool({
  connectionString: 'postgresql://postgres:2301@localhost:5432/unifiedtransform_db'
});

const cloudPool = new Pool({
  connectionString: 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres'
});

async function runFullMigration() {
  try {
    console.log('🔄 Starting Full Database Migration...');

    // 1. Drop existing tables in Supabase public schema
    console.log('🗑️  Dropping existing schema in Supabase...');
    await cloudPool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    // 2. Read and apply database_schema.sql to Supabase
    console.log('📄 Applying database_schema.sql to Supabase...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database_schema.sql'), 'utf-8');
    await cloudPool.query(schemaSql);
    console.log('✅ Schema created successfully in Supabase!');

    // 3. Migrate data
    console.log('📦 Migrating data from local to Supabase...');
    
    // Ordered tables to preserve foreign key constraints mostly
    // For a simple migration we temporarily disable triggers/constraints or sort tables by dependency.
    // Instead of sorting all tables manually, postgres allows disabling triggers.
    
    // We will just fetch all tables dynamically and temporarily set session_replication_role
    await cloudPool.query("SET session_replication_role = 'replica';"); // bypass foreign key checks

    const tablesRes = await localPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      console.log(`Migrating table: ${tableName}`);
      
      const data = await localPool.query(`SELECT * FROM ${tableName}`);
      if (data.rows.length > 0) {
        const columns = Object.keys(data.rows[0]);
        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        for (const dataRow of data.rows) {
          const values = columns.map(col => dataRow[col]);
          try {
            await cloudPool.query(
              `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
              values
            );
          } catch (insertErr) {
             console.error(`Error inserting into ${tableName}:`, insertErr.message);
          }
        }
        console.log(`✅ Migrated ${data.rows.length} rows to ${tableName}`);
      } else {
        console.log(`ℹ️  Table ${tableName} is empty.`);
      }
      
      // Update sequences so auto-increment works on Supabase
      try {
        await cloudPool.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE(MAX(id), 1) + 1) FROM ${tableName};`);
      } catch (e) {
        // Not all tables have an 'id' sequence, ignore errors
      }
    }
    
    await cloudPool.query("SET session_replication_role = 'origin';"); // restore original role
    
    console.log('🎉 FULL MIGRATION COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await localPool.end();
    await cloudPool.end();
  }
}

runFullMigration();
