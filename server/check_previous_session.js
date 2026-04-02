const db = require('./src/config/database');

async function checkPreviousSession() {
  try {
    console.log('Checking all sessions:');
    const sessions = await db.query('SELECT * FROM school_sessions ORDER BY id');
    sessions.rows.forEach(s => {
      console.log(`  - ID: ${s.id}, Session: ${s.session}, Current: ${s.current}`);
    });
    
    console.log('\nChecking student_academic_infos for all sessions:');
    const academicInfo = await db.query(`
      SELECT sai.session_id, sai.class_id, sc.name as class_name, COUNT(*) as student_count
      FROM student_academic_infos sai
      JOIN school_classes sc ON sc.id = sai.class_id
      GROUP BY sai.session_id, sai.class_id, sc.name
      ORDER BY sai.session_id, sai.class_id
    `);
    
    academicInfo.rows.forEach(row => {
      console.log(`  - Session ${row.session_id}, Class ${row.class_name} (${row.class_id}): ${row.student_count} students`);
    });
    
    // Check specifically for the 69 students I found earlier
    console.log('\nChecking where the 69 students are:');
    const specificCheck = await db.query(`
      SELECT sai.session_id, sai.class_id, sai.section_id, sc.name as class_name, s.name as section_name, COUNT(*) as count
      FROM student_academic_infos sai
      JOIN school_classes sc ON sc.id = sai.class_id
      JOIN sections s ON s.id = sai.section_id
      WHERE sc.name ILIKE '%sem-2%'
      GROUP BY sai.session_id, sai.class_id, sai.section_id, sc.name, s.name
      ORDER BY sai.session_id
    `);
    
    specificCheck.rows.forEach(row => {
      console.log(`  - Session ${row.session_id}, ${row.class_name} (${row.class_id}), Section ${row.section_name} (${row.section_id}): ${row.count} students`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkPreviousSession();
