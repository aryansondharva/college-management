const db = require('./src/config/database');

async function fixStudentClassAssignment() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Fixing student class assignments...');
    
    // Get all students in the wrong class (class_id = 2) in current session (session_id = 3)
    const studentsToFix = await client.query(`
      SELECT sai.student_id, sai.section_id, u.first_name, u.last_name
      FROM student_academic_infos sai
      JOIN users u ON u.id = sai.student_id
      WHERE sai.session_id = 3 AND sai.class_id = 2
      ORDER BY u.first_name, u.last_name
    `);
    
    console.log(`Found ${studentsToFix.rows.length} students in wrong class assignment`);
    
    // Correct class and section mappings
    const correctClassId = 21; // Sem-2 in current session
    
    // Get section mapping from old to new
    const sectionMapping = {
      3: 41, // Section A (old) -> Section A (new)
      4: 42  // Section B (old) -> Section B (new)
    };
    
    let fixedCount = 0;
    
    for (const student of studentsToFix.rows) {
      const newSectionId = sectionMapping[student.section_id];
      
      if (newSectionId) {
        // Update the student's class and section assignment
        await client.query(`
          UPDATE student_academic_infos 
          SET class_id = $1, section_id = $2, updated_at = NOW()
          WHERE student_id = $3 AND session_id = 3
        `, [correctClassId, newSectionId, student.student_id]);
        
        // Also update promotions table if needed
        await client.query(`
          UPDATE promotions 
          SET class_id = $1, section_id = $2
          WHERE student_id = $3 AND session_id = 3
        `, [correctClassId, newSectionId, student.student_id]);
        
        fixedCount++;
        console.log(`Fixed: ${student.first_name} ${student.last_name} -> Section ${newSectionId === 41 ? 'A' : 'B'}`);
      } else {
        console.log(`Warning: Could not map section ${student.section_id} for ${student.first_name} ${student.last_name}`);
      }
    }
    
    await client.query('COMMIT');
    console.log(`\nFix completed! ${fixedCount} students moved to correct class assignment.`);
    
    // Verify the result
    const verification = await client.query(`
      SELECT sai.section_id, s.name as section_name, COUNT(*) as count
      FROM student_academic_infos sai
      JOIN sections s ON s.id = sai.section_id
      WHERE sai.session_id = 3 AND sai.class_id = 21
      GROUP BY sai.section_id, s.name
      ORDER BY sai.section_id
    `);
    
    console.log('\nUpdated student counts in correct Sem-2 class:');
    verification.rows.forEach(row => {
      console.log(`  - Section ${row.section_name} (ID: ${row.section_id}): ${row.count} students`);
    });
    
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during fix:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixStudentClassAssignment();
