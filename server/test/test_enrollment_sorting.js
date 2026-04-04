const db = require('./src/config/database');

async function testEnrollmentSorting() {
  try {
    // Test the new sorting query
    const result = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.enrollment_no,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student' AND sai.session_id = 3 AND sai.class_id = 21 AND sai.section_id = 41
      ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
    `);
    
    console.log(`Students sorted by enrollment number (first 15):`);
    console.log(`Total students: ${result.rows.length}`);
    console.log('\nEnrollment No | Student Name');
    console.log('-------------|----------------');
    
    result.rows.slice(0, 15).forEach(s => {
      const enrollment = s.enrollment_no || 'No Enrollment';
      const name = `${s.first_name} ${s.last_name}`;
      console.log(`${enrollment.padEnd(12)} | ${name}`);
    });
    
    if (result.rows.length > 15) {
      console.log(`  ... and ${result.rows.length - 15} more students`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testEnrollmentSorting();
