/**
 * migrate_to_supabase_auth.js
 * ----------------------------
 * Migrates users from public.users table to Supabase Auth dashboard.
 * 
 * Target: Emails from your public.users table
 * Passwords: As per your previous configuration.
 */

const { Pool } = require('pg');
const https = require('https');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUPABASE_DB_URL  = 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres';
const SUPABASE_PROJECT_ID = 'ibcggdhomcyoswtotygc';
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to create a user via Supabase Auth Admin API
function createAuthUser(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: email,
      password: password,
      email_confirm: true // important: bypasses email confirmation
    });

    const options = {
      hostname: `${SUPABASE_PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          try {
            const err = JSON.parse(responseData);
            resolve({ error: err.msg || err.message || 'Unknown error', status: res.statusCode });
          } catch(e) {
            resolve({ error: responseData, status: res.statusCode });
          }
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function migrate() {
  console.log('🔄 Starting migration to Supabase Auth Dashboard...\n');

  try {
    // 1. Fetch all users from public.users table
    const result = await pool.query('SELECT email, role FROM users');
    const users = result.rows;
    console.log(`📋 Found ${users.length} users in public.users table.\n`);

    let successCount = 0;
    let failCount = 0;
    let existCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Determine password based on role
      let password = 'student123';
      const role = (user.role || '').toLowerCase();
      if (role === 'admin') password = 'admin123';
      else if (role === 'teacher') password = 'teacher123';

      const res = await createAuthUser(user.email, password);

      if (res.id) {
        console.log(`  ✅ Created: ${user.email} (${role})`);
        successCount++;
      } else if (res.error && res.error.includes('already exists')) {
        console.log(`  ℹ️  Skipped (already exists): ${user.email}`);
        existCount++;
      } else {
        console.log(`  ❌ Failed: ${user.email} - ${res.error}`);
        failCount++;
      }
    }

    console.log('\n🎉 MIGRATION COMPLETE!');
    console.log(`📊 Summary: ${successCount} Created, ${existCount} Already Existed, ${failCount} Failed.`);
    console.log('🌐 Check your Supabase "Authentication" tab now!');

  } catch (err) {
    console.error('\n❌ Migration script failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
