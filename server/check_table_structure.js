const db = require('./src/config/database');

async function checkTableStructure() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_academic_infos' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in student_academic_infos table:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTableStructure();
