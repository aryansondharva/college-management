const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL (Render/Supabase) or fall back to individual vars (local dev)
const poolConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase/Render
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 18000,
  }
  : {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'unifiedtransform_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

const pool = new Pool(poolConfig);

// Health check on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ DATABASE CONNECTION ERROR:', err.message);
    if (err.message.includes('ENETUNREACH')) {
      console.error('💡 TIP: Use the Supavisor Pooler URL (*.pooler.supabase.com) to solve IPv6/IPv4 issues.');
    }
  } else {
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY TO:', process.env.DATABASE_URL ? 'Cloud (Supabase/Pooler)' : 'Local');
    release();
  }
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
