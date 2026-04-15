require('dotenv').config();
const db = require('./src/config/database');

async function check() {
  try {
    console.log('=== Checking recent password updates ===');
    
    // Check users with recent password updates
    const recentUpdates = await db.query(`
      SELECT id, first_name, last_name, email, enrollment_no, updated_at 
      FROM users 
      WHERE role = 'student' 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    console.log('Recent user updates:');
    recentUpdates.rows.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (${user.enrollment_no}) - Updated: ${user.updated_at}`);
    });
    
    // Check specifically for Aryan
    console.log('\n=== Aryan specific check ===');
    const aryan = await db.query(`
      SELECT id, first_name, last_name, email, enrollment_no, created_at, updated_at 
      FROM users 
      WHERE enrollment_no = '251100107001'
    `);
    
    if (aryan.rows[0]) {
      console.log('Aryan details:', aryan.rows[0]);
      console.log('Password was last updated:', aryan.rows[0].updated_at);
      console.log('Account created:', aryan.rows[0].created_at);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
