require('dotenv').config();
const db = require('./src/config/database');

async function createLog() {
  try {
    console.log('=== Creating missing activity log for Aryan ===');
    
    // Create activity log for Aryan's password change
    const studentId = 2;
    const description = 'Student Aryan Sondharva (aryansondharva25@gmail.com) changed their password.';
    
    const result = await db.query(
      `INSERT INTO activity_logs (user_id, action, description, new_password, performed_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [studentId, 'PASSWORD_CHANGE', description, '[Password changed before logging was enabled]', studentId, '2026-04-15T09:46:12.847Z']
    );
    
    console.log('Created activity log:', result.rows[0]);
    
    // Verify it shows up in Aura
    console.log('\n=== Verifying in Aura query ===');
    const auraResult = await db.query(
      `SELECT al.id, al.action, al.description, al.new_password, al.created_at,
              u.first_name, u.last_name, u.email, u.enrollment_no, u.role
       FROM activity_logs al
       JOIN users u ON u.id = al.user_id
       WHERE u.role = 'student'
       ORDER BY al.created_at DESC
       LIMIT 5`
    );
    
    console.log('Aura now shows:', auraResult.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createLog();
