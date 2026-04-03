/**
 * reset_supabase_passwords.js
 * ----------------------------
 * Resets all user passwords in your Supabase 'public.users' table
 * to your specified defaults.
 * 
 * Target: admin@ut.com -> admin123
 *        All Teachers   -> teacher123
 *        All Students   -> student123
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Supabase Connection String (from push_to_supabase.js)
const SUPABASE_URL = 'postgresql://postgres:1046402103As@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetPasswords() {
  console.log('🔄 Starting Password Resets on Supabase...\n');

  try {
    // 1. Reset Admin
    console.log('👤 Resetting Admin (admin@ut.com)...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const adminRes = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
      [adminHash, 'admin@ut.com']
    );
    if (adminRes.rows.length > 0) {
      console.log('  ✅ Admin password set to: admin123');
    } else {
      console.log('  ⚠️ Admin account (admin@ut.com) not found!');
    }

    // 2. Reset all Teachers
    console.log('\n👨‍🏫 Resetting all Teachers...');
    const teacherHash = await bcrypt.hash('teacher123', 10);
    const teacherRes = await pool.query(
      'UPDATE users SET password = $1 WHERE LOWER(role) = $2',
      [teacherHash, 'teacher']
    );
    console.log(`  ✅ Reset passwords for ${teacherRes.rowCount} teachers to: teacher123`);

    // 3. Reset all Students
    console.log('\n🎓 Resetting all Students...');
    const studentHash = await bcrypt.hash('student123', 10);
    const studentRes = await pool.query(
      'UPDATE users SET password = $1 WHERE LOWER(role) = $2',
      [studentHash, 'student']
    );
    console.log(`  ✅ Reset passwords for ${studentRes.rowCount} students to: student123`);

    console.log('\n🎉 ALL LIVE PASSWORDS UPDATED SUCCESSFULLY!');
    console.log('🌐 You can now log into your live site with these credentials.');

  } catch (err) {
    console.error('\n❌ Password reset failed:', err.message);
  } finally {
    await pool.end();
  }
}

resetPasswords();
