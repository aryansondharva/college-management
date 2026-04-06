const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('🚀 Running migration for push notifications on Supabase...');
    console.log('📡 Connecting to:', process.env.DATABASE_URL.split('@')[1]);
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS push_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, token)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ push_tokens table created/verified on Supabase!');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
