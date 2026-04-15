require('dotenv').config();
const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    console.log('=== Testing password change logging ===');
    
    // Test the exact INSERT query from forgot-password route
    const studentId = 2; // Aryan's ID
    const newPassword = 'test123';
    const description = `Student Aryan Sondharva (aryansondharva25@gmail.com) reset their password via forgot password.`;
    
    console.log('Inserting activity log...');
    const result = await db.query(
      `INSERT INTO activity_logs (user_id, action, description, new_password, performed_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [studentId, 'PASSWORD_RESET', description, newPassword, studentId]
    );
    
    console.log('Inserted log:', result.rows[0]);
    
    // Now test the Aura data query
    console.log('\n=== Testing Aura data query ===');
    const auraResult = await db.query(
      `SELECT al.id, al.action, al.description, al.new_password, al.created_at,
              u.first_name, u.last_name, u.email, u.enrollment_no, u.role
       FROM activity_logs al
       JOIN users u ON u.id = al.user_id
       WHERE u.role = 'student'
       ORDER BY al.created_at DESC
       LIMIT 5`
    );
    
    console.log('Aura query result:', auraResult.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

test();
