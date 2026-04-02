const db = require('./src/config/database');

async function checkSem2Classes() {
  try {
    // Check all Sem-2 classes
    const sem2Classes = await db.query(`
      SELECT sc.id, sc.name, sc.session_id, ss.session
      FROM school_classes sc
      JOIN school_sessions ss ON ss.id = sc.session_id
      WHERE sc.name ILIKE '%sem-2%'
      ORDER BY sc.id
    `);
    
    console.log('All Sem-2 classes:');
    sem2Classes.rows.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.name}, Session: ${c.session} (${c.session_id})`);
    });
    
    // Check sections for each Sem-2 class
    for (const cls of sem2Classes.rows) {
      const sections = await db.query(`
        SELECT s.id, s.name, COUNT(sai.student_id) as student_count
        FROM sections s
        LEFT JOIN student_academic_infos sai ON sai.section_id = s.id AND sai.session_id = $1
        WHERE s.class_id = $2
        GROUP BY s.id, s.name
        ORDER BY s.name
      `, [cls.session_id, cls.id]);
      
      console.log(`\nSections for ${cls.name} (ID: ${cls.id}):`);
      sections.rows.forEach(s => {
        console.log(`  - Section ${s.name} (ID: ${s.id}): ${s.student_count} students`);
      });
    }
    
    // Check current session
    const currentSession = await db.query('SELECT * FROM school_sessions WHERE current = true');
    console.log('\nCurrent session:', currentSession.rows[0]);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSem2Classes();
