const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres'
});

async function checkTables() {
  try {
    console.log('📡 Connecting to Supabase...');
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 LIVE TABLES ON SUPABASE:');
    res.rows.forEach(r => console.log(`✅ ${r.table_name}`));
    console.log(`\nTotal Live Tables: ${res.rows.length}`);

  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
