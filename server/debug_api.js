const db = require('./src/config/database');

async function debugAPI() {
  try {
    // Get current session
    const currentSession = await db.query('SELECT * FROM school_sessions WHERE current = true');
    const sessionId = currentSession.rows[0].id;
    
    // Get Sem-2 class
    const sem2Class = await db.query('SELECT * FROM school_classes WHERE name ILIKE \'%sem-2%\' AND id = 2');
    const classId = sem2Class.rows[0].id;
    
    // Get Section A
    const sectionA = await db.query('SELECT * FROM sections WHERE class_id = $1 AND name = \'A\'', [classId]);
    const sectionId = sectionA.rows[0].id;
    
    console.log('API Parameters:', { sessionId, classId, sectionId });
    
    // Simulate the exact API call
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.gender, u.photo, u.role, u.enrollment_no,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student'
    `;
    
    let params = [];
    let finalQuery = query;
    
    if (sessionId) { 
      params.push(sessionId); 
      finalQuery += ` AND sai.session_id = $${params.length}`; 
    }
    if (classId && classId !== '0') { 
      params.push(classId); 
      finalQuery += ` AND sai.class_id = $${params.length}`; 
    }
    if (sectionId && sectionId !== '0') { 
      params.push(sectionId); 
      finalQuery += ` AND sai.section_id = $${params.length}`; 
    }
    finalQuery += ' ORDER BY u.first_name';
    
    console.log('Final Query:', finalQuery);
    console.log('Parameters:', params);
    
    const result = await db.query(finalQuery, params);
    
    console.log('\nAPI Response:');
    console.log('Total students found:', result.rows.length);
    console.log('First 5 students:');
    result.rows.slice(0, 5).forEach(r => {
      console.log(`  - ${r.first_name} ${r.last_name} (ID: ${r.id}, Class: ${r.class_name}, Section: ${r.section_name})`);
    });
    
    // Check if any students have null values
    const nullStudents = result.rows.filter(r => r.class_id === null || r.section_id === null || r.session_id === null);
    console.log('\nStudents with null academic info:', nullStudents.length);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debugAPI();
