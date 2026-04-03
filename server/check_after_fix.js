const db = require('./src/config/database');

async function checkAfterFix() {
  try {
    console.log('Checking student assignments after fix...');
    
    // Check all students in current session
    const allCurrentStudents = await db.query(`
      SELECT sai.class_id, sai.section_id, sc.name as class_name, s.name as section_name, COUNT(*) as count
      FROM student_academic_infos sai
      JOIN school_classes sc ON sc.id = sai.class_id
      JOIN sections s ON s.id = sai.section_id
      WHERE sai.session_id = 3
      GROUP BY sai.class_id, sai.section_id, sc.name, s.name
      ORDER BY sai.class_id, sai.section_id
    `);
    
    console.log('All students in current session (Session 3):');
    allCurrentStudents.rows.forEach(row => {
      console.log(`  - ${row.class_name} (ID: ${row.class_id}), Section ${row.section_name} (ID: ${row.section_id}): ${row.count} students`);
    });
    
    // Check specifically for the two students that were showing
    console.log('\nChecking the two students that were originally showing:');
    const specificStudents = await db.query(`
      SELECT u.id, u.first_name, u.last_name,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student' 
      AND (u.first_name ILIKE '%aryan%' OR u.first_name ILIKE '%nachiket%')
      AND sai.session_id = 3
      ORDER BY u.first_name
    `);
    
    specificStudents.rows.forEach(s => {
      console.log(`  - ${s.first_name} ${s.last_name} (ID: ${s.id})`);
      console.log(`    Class: ${s.class_name} (${s.class_id}), Section: ${s.section_name} (${s.section_id})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAfterFix();
