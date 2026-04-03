const db = require('./src/config/database');

async function checkClass2() {
  try {
    // Check class ID 2 directly
    const class2 = await db.query(`
      SELECT c.*, s.session
      FROM school_classes c
      JOIN school_sessions s ON s.id = c.session_id
      WHERE c.id = 2
    `);
    
    console.log('Class ID 2 details:');
    if (class2.rows.length > 0) {
      console.log(`  - ID: ${class2.rows[0].id}, Name: ${class2.rows[0].name}, Session: ${class2.rows[0].session}, Session ID: ${class2.rows[0].session_id}`);
    } else {
      console.log('  Class ID 2 not found');
    }
    
    // Check what session the 69 students are actually in
    const studentsInClass2 = await db.query(`
      SELECT sai.session_id, s.session, COUNT(*) as count
      FROM student_academic_infos sai
      JOIN school_sessions s ON s.id = sai.session_id
      WHERE sai.class_id = 2
      GROUP BY sai.session_id, s.session
    `);
    
    console.log('\nStudents in Class ID 2 by session:');
    studentsInClass2.rows.forEach(row => {
      console.log(`  - Session ${row.session_id} (${row.session}): ${row.count} students`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkClass2();
