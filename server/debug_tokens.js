const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugTokens() {
  try {
    console.log('📡 Checking Push Tokens in Supabase...');
    
    // 1. Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'push_tokens'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);

    // 2. Count tokens
    const countRes = await pool.query('SELECT COUNT(*) FROM push_tokens');
    console.log('Total tokens in DB:', countRes.rows[0].count);

    // 3. List recent tokens (redacted for privacy)
    const listRes = await pool.query(`
      SELECT user_id, LEFT(token, 15) || '...' as token_start, updated_at 
      FROM push_tokens 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    console.table(listRes.rows);

    if (listRes.rows.length === 0) {
      console.log('\n❌ NO TOKENS FOUND. The app is not sending the token to the server.');
      console.log('Ensure you have LOGGED IN again on your physical phone.');
    }

  } catch (err) {
    console.error('❌ Debug failed:', err.message);
  } finally {
    await pool.end();
  }
}

debugTokens();
