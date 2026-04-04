const db = require('./src/config/database');

async function testCourses() {
  try {
    // Test courses for Sem-2 (class_id = 2)
    const result = await db.query(`
      SELECT c.*, sc.name as class_name, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name 
      FROM courses c 
      JOIN school_classes sc ON sc.id = c.class_id
      LEFT JOIN users u ON u.id = c.teacher_id
      WHERE c.class_id = $1
      ORDER BY c.name
    `, [2]);
    
    console.log('Courses for Sem-2 (class_id = 2):');
    console.log('Total courses:', result.rows.length);
    result.rows.forEach(c => {
      console.log(`  - ${c.name} (${c.code}) - Teacher: ${c.teacher_first_name || 'Not assigned'} ${c.teacher_last_name || ''}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testCourses();
