const db = require('./src/config/database');

async function checkStudents() {
  try {
    // Check total students
    const totalStudents = await db.query('SELECT COUNT(*) FROM users WHERE role = \'student\'');
    console.log('Total students in users table:', totalStudents.rows[0].count);
    
    // Check students with academic info for current session
    const academicInfo = await db.query('SELECT COUNT(*) FROM student_academic_infos');
    console.log('Total academic info records:', academicInfo.rows[0].count);
    
    // Get current session
    const currentSession = await db.query('SELECT * FROM school_sessions WHERE current = true');
    if (currentSession.rows.length > 0) {
      console.log('Current session:', currentSession.rows[0]);
      
      // Check students in current session
      const sessionStudents = await db.query('SELECT COUNT(*) FROM student_academic_infos WHERE session_id = $1', [currentSession.rows[0].id]);
      console.log('Students in current session:', sessionStudents.rows[0].count);
    }
    
    // Check class and section info
    const classes = await db.query('SELECT * FROM school_classes');
    console.log('Total classes:', classes.rows.length);
    classes.rows.forEach(c => console.log(`  Class: ${c.name} (ID: ${c.id})`));
    
    const sections = await db.query('SELECT * FROM sections');
    console.log('Total sections:', sections.rows.length);
    sections.rows.forEach(s => console.log(`  Section: ${s.name} (ID: ${s.id}, Class ID: ${s.class_id})`));
    
    // Check specific query for Sem-2 Section A
    const sem2Class = await db.query('SELECT * FROM school_classes WHERE name ILIKE \'%sem-2%\'');
    if (sem2Class.rows.length > 0) {
      const sem2Id = sem2Class.rows[0].id;
      console.log('\nSem-2 Class ID:', sem2Id);
      
      const sectionA = await db.query('SELECT * FROM sections WHERE class_id = $1 AND name ILIKE \'%a%\'', [sem2Id]);
      if (sectionA.rows.length > 0) {
        const sectionAId = sectionA.rows[0].id;
        console.log('Section A ID:', sectionAId);
        
        // Test the exact query from the API
        const testQuery = `
          SELECT u.id, u.first_name, u.last_name, u.email, u.gender, u.photo, u.role, u.enrollment_no,
                 sai.class_id, sai.section_id, sai.session_id,
                 sc.name as class_name, s.name as section_name
          FROM users u
          LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
          LEFT JOIN school_classes sc ON sc.id = sai.class_id
          LEFT JOIN sections s ON s.id = sai.section_id
          WHERE u.role = 'student' AND sai.session_id = $1 AND sai.class_id = $2 AND sai.section_id = $3
          ORDER BY u.first_name
        `;
        
        const result = await db.query(testQuery, [currentSession.rows[0].id, sem2Id, sectionAId]);
        console.log('\nStudents returned by API query for Sem-2 Section A:', result.rows.length);
        result.rows.forEach(r => console.log(`  - ${r.first_name} ${r.last_name} (ID: ${r.id})`));
        
        // Also check students without the academic info filter
        const allStudentsQuery = `
          SELECT u.id, u.first_name, u.last_name, u.email, u.gender, u.photo, u.role, u.enrollment_no
          FROM users u
          WHERE u.role = 'student'
          ORDER BY u.first_name
        `;
        
        const allStudents = await db.query(allStudentsQuery);
        console.log('\nAll students in system:', allStudents.rows.length);
        allStudents.rows.forEach(r => console.log(`  - ${r.first_name} ${r.last_name} (ID: ${r.id})`));
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkStudents();
