// Script to migrate local database to cloud database
const { Pool } = require('pg');

// Local database connection
const localPool = new Pool({
  connectionString: 'postgresql://username:password@localhost:5432/college_db' // Update with your local credentials
});

// Cloud database connection
const cloudPool = new Pool({
  connectionString: 'postgresql://postgres:[YOUR-PASSWORD]@db.ibcggdhomcyoswtotygc.supabase.co:5432/postgres'
});

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Get all tables
    const tables = await localPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`Migrating table: ${tableName}`);
      
      // Get data from local
      const data = await localPool.query(`SELECT * FROM ${tableName}`);
      
      if (data.rows.length > 0) {
        // Get column names
        const columns = Object.keys(data.rows[0]);
        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        // Insert into cloud
        for (const row of data.rows) {
          const values = columns.map(col => row[col]);
          await cloudPool.query(
            `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
            values
          );
        }
        
        console.log(`✅ Migrated ${data.rows.length} rows from ${tableName}`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await localPool.end();
    await cloudPool.end();
  }
}

migrateDatabase();
