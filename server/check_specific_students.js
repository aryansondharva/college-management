const db = require('./src/config/database');

async function checkSpecificStudents() {
  try {
    // Check if Aryan Sondharva and Nachiket Ashwani exist
    const result = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.enrollment_no,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student' 
      AND (u.first_name ILIKE '%aryan%' OR u.first_name ILIKE '%nachiket%')
      ORDER BY u.first_name
    `);
    
    console.log('Found students:');
    result.rows.forEach(r => {
      console.log(`  - ${r.first_name} ${r.last_name} (ID: ${r.id})`);
      console.log(`    Class: ${r.class_name} (${r.class_id}), Section: ${r.section_name} (${r.section_id}), Session: ${r.session_id}`);
    });
    
    // Also check all students for the specific section (Sem-2, Section A, current session)
    const sectionStudents = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.enrollment_no,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student' 
      AND sai.session_id = 3
      AND sai.class_id = 2
      AND sai.section_id = 3
      ORDER BY u.first_name
    `);
    
    console.log('\nAll students in Sem-2 Section A (Session 3):');
    console.log(`Total: ${sectionStudents.rows.length}`);
    sectionStudents.rows.slice(0, 10).forEach(r => {
      console.log(`  - ${r.first_name} ${r.last_name} (ID: ${r.id})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSpecificStudents();
