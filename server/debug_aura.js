require('dotenv').config();
const db = require('./src/config/database');

async function debug() {
  try {
    console.log('=== Checking student 251100107001 ===');
    const student = await db.query('SELECT id, first_name, last_name, email, enrollment_no FROM users WHERE enrollment_no = $1', ['251100107001']);
    console.log('Student:', student.rows[0] || 'Not found');
    
    if (student.rows[0]) {
      console.log('\n=== Activity logs for this student ===');
      const logs = await db.query('SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [student.rows[0].id]);
      console.log('Logs:', logs.rows);
    }
    
    console.log('\n=== All recent student activity logs ===');
    const allLogs = await db.query('SELECT al.*, u.enrollment_no FROM activity_logs al JOIN users u ON u.id = al.user_id WHERE u.role = $1 ORDER BY al.created_at DESC LIMIT 10', ['student']);
    console.log('All student logs:', allLogs.rows);
    
    console.log('\n=== Check new_password column ===');
    const columnCheck = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_logs' AND column_name = 'new_password'
    `);
    console.log('new_password column:', columnCheck.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

debug();
