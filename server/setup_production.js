// Setup script for production deployment
const fs = require('fs');
const { Pool } = require('pg');

// Get your actual Supabase password from dashboard
const SUPABASE_PASSWORD = 'REPLACE_WITH_YOUR_REAL_PASSWORD'; // Replace this!

const productionEnv = `NODE_ENV=production
DATABASE_URL=postgresql://postgres:1046402103AS@db.ibcggdhomcyoswtotygc.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret-key-here
PORT=10000`;

// Write to .env.production
fs.writeFileSync('.env.production', productionEnv);

console.log('✅ .env.production updated!');
console.log('📋 Next steps:');
console.log('1. Replace YOUR_ACTUAL_PASSWORD_HERE with your real Supabase password');
console.log('2. Run: render deploy');

// Test connection
async function testConnection() {
  try {
    const pool = new Pool({
      connectionString: `postgresql://postgres:${SUPABASE_PASSWORD}@db.ibcggdhomcyoswtotygc.supabase.co:5432/postgres`
    });
    
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful!');
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Check your password in Supabase dashboard');
  }
}

testConnection();
