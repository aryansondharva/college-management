const db = require('./src/config/database');

async function promoteSem2Students() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Starting promotion of Sem-2 students...');
    
    // Get all Sem-2 students from previous session (session_id = 1, class_id = 2)
    const studentsToPromote = await client.query(`
      SELECT sai.student_id, u.first_name, u.last_name
      FROM student_academic_infos sai
      JOIN users u ON u.id = sai.student_id
      WHERE sai.session_id = 1 AND sai.class_id = 2
      ORDER BY u.first_name, u.last_name
    `);
    
    console.log(`Found ${studentsToPromote.rows.length} students to promote`);
    
    // Current session and class info
    const currentSessionId = 3; // 2025-26 EVEN
    const currentClassId = 21;  // Sem-2 in current session
    const currentSectionAId = 41; // Section A in current session
    
    let promotedCount = 0;
    
    for (const student of studentsToPromote.rows) {
      // Check if student is already in current session
      const existing = await client.query(
        'SELECT 1 FROM student_academic_infos WHERE student_id = $1 AND session_id = $2',
        [student.student_id, currentSessionId]
      );
      
      if (existing.rows.length === 0) {
        // Promote to current session
        await client.query(
          `INSERT INTO student_academic_infos (student_id, session_id, class_id, section_id)
           VALUES ($1, $2, $3, $4)`,
          [
            student.student_id, 
            currentSessionId, 
            currentClassId, 
            currentSectionAId
          ]
        );
        
        // Log promotion
        await client.query(
          'INSERT INTO promotions (student_id, session_id, class_id, section_id) VALUES ($1, $2, $3, $4)',
          [student.student_id, currentSessionId, currentClassId, currentSectionAId]
        );
        
        promotedCount++;
        console.log(`Promoted: ${student.first_name} ${student.last_name}`);
      } else {
        console.log(`Already promoted: ${student.first_name} ${student.last_name}`);
      }
    }
    
    await client.query('COMMIT');
    console.log(`\nPromotion completed! ${promotedCount} students promoted to current session.`);
    
    // Verify the result
    const verification = await client.query(`
      SELECT COUNT(*) as count
      FROM student_academic_infos sai
      WHERE sai.session_id = $1 AND sai.class_id = $2 AND sai.section_id = $3
    `, [currentSessionId, currentClassId, currentSectionAId]);
    
    console.log(`Total students in Sem-2 Section A (current session): ${verification.rows[0].count}`);
    
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during promotion:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

promoteSem2Students();
