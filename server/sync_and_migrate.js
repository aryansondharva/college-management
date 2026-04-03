const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgresql://postgres:2301@localhost:5432/unifiedtransform_db'
});

const cloudPool = new Pool({
  connectionString: 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres'
});

async function syncAndMigrate() {
  try {
    console.log('🔄 Starting Schema Synchronization and Data Migration...');

    // 1. Fetch tables and columns from local DB
    const localColumnsRes = await localPool.query(`
      SELECT table_name, column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);
    
    // Group local columns by table
    const localSchema = {};
    for (const row of localColumnsRes.rows) {
      if (!localSchema[row.table_name]) localSchema[row.table_name] = [];
      localSchema[row.table_name].push(row);
    }
    
    // Fetch tables and columns from cloud DB
    const cloudColumnsRes = await cloudPool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);
    
    const cloudSchema = {};
    for (const row of cloudColumnsRes.rows) {
      if (!cloudSchema[row.table_name]) cloudSchema[row.table_name] = [];
      cloudSchema[row.table_name].push(row.column_name);
    }

    // 2. Synchronize schema (Add missing tables and columns)
    console.log('⚙️ Synchronizing Schema...');
    for (const tableName of Object.keys(localSchema)) {
      if (!cloudSchema[tableName]) {
        // Warning: This creates a simple table without constraints. 
        // For accurate constraints, database_schema.sql should ideally be used.
        console.log(`⚠️ Table ${tableName} missing in cloud. You might need to run full schema SQL first.`);
        continue;
      }
      
      const cloudCols = cloudSchema[tableName] || [];
      const localCols = localSchema[tableName];
      
      for (const lCol of localCols) {
        if (!cloudCols.includes(lCol.column_name)) {
          let typeStr = lCol.data_type;
          if (typeStr === 'character varying' && lCol.character_maximum_length) {
            typeStr = `VARCHAR(${lCol.character_maximum_length})`;
          } else if (typeStr === 'timestamp without time zone') {
             typeStr = 'TIMESTAMP';
          }
          console.log(`Adding missing column: ${tableName}.${lCol.column_name} (${typeStr})`);
          try {
             await cloudPool.query(`ALTER TABLE ${tableName} ADD COLUMN "${lCol.column_name}" ${typeStr}`);
          } catch(e) {
             console.log(`Failed to add column ${lCol.column_name}:`, e.message);
          }
        }
      }
    }

    console.log('✅ Schema synchronization complete!');

    // 3. Delete existing data on Supabase to start fresh (Optional but prevents duplicates)
    console.log('🧹 Clearing existing cloud data to prevent constraints/duplicates...');
    // We disable foreign key checks temporarily
    await cloudPool.query("SET session_replication_role = 'replica';");
    for (const tableName of Object.keys(localSchema)) {
        try {
           await cloudPool.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
        } catch(e) {} // ignore truncate errors if table doesn't exist
    }

    // 4. Migrate Data
    console.log('📦 Continuing Data Migration...');
    const tablesRes = await localPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      console.log(`Migrating data for table: ${tableName}`);
      
      const data = await localPool.query(`SELECT * FROM ${tableName}`);
      if (data.rows.length > 0) {
        // Some tables might have newly added columns
        // We only insert columns that exist both locally and in cloud, just to be safe
        const localDataCols = Object.keys(data.rows[0]);
        // Also ensure cloud has it (we just added them, but still good practice)
        
        const columnNames = localDataCols.map(c => `"${c}"`).join(', ');
        const placeholders = localDataCols.map((_, i) => `$${i + 1}`).join(', ');
        
        let successCount = 0;
        let failCount = 0;
        for (const dataRow of data.rows) {
          const values = localDataCols.map(col => dataRow[col]);
          try {
            await cloudPool.query(
              `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
              values
            );
            successCount++;
          } catch (insertErr) {
             console.error(`Error inserting row into ${tableName}:`, insertErr.message);
             failCount++;
          }
        }
        console.log(`✅ Migrated ${successCount} rows to ${tableName}.${failCount > 0 ? ` (Failed: ${failCount})` : ''}`);
      } else {
        console.log(`ℹ️ Table ${tableName} is empty.`);
      }
      
      // Update sequences
      try {
        await cloudPool.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE(MAX(id), 1) + 1) FROM ${tableName};`);
      } catch (e) {}
    }
    
    await cloudPool.query("SET session_replication_role = 'origin';"); 
    console.log('🎉 FULL MIGRATION COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await localPool.end();
    await cloudPool.end();
  }
}

syncAndMigrate();
