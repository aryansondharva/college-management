const db = require('./src/config/database');

async function checkHighEnrollmentB() {
  try {
    console.log('Checking for Section B students with enrollment numbers 251100107105+...\n');
    
    // Check ALL students in Section B regardless of attendance
    const allSectionB = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.enrollment_no
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      WHERE u.role = 'student' AND sai.session_id = 3 AND sai.class_id = 21 AND sai.section_id = 42
      ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
    `);
    
    console.log('ALL Section B students:');
    allSectionB.rows.forEach(s => {
      console.log(`  ${s.enrollment_no || 'No Enrollment'} - ${s.first_name} ${s.last_name} (ID: ${s.id})`);
    });
    
    // Check specifically for students with enrollment >= 251100107105
    const highEnrollment = allSectionB.rows.filter(s => 
      s.enrollment_no && parseInt(s.enrollment_no) >= 251100107105
    );
    
    console.log(`\nStudents with enrollment >= 251100107105: ${highEnrollment.length}`);
    highEnrollment.forEach(s => {
      console.log(`  ${s.enrollment_no} - ${s.first_name} ${s.last_name} (ID: ${s.id})`);
    });
    
    // Check if these students have any attendance records
    if (highEnrollment.length > 0) {
      console.log('\nChecking attendance for high enrollment students:');
      for (const student of highEnrollment) {
        const attendanceCheck = await db.query(`
          SELECT COUNT(*) as count
          FROM attendances a
          WHERE a.student_id = $1 AND a.session_id = 3 AND a.class_id = 21 AND a.section_id = 42
        `, [student.id]);
        
        console.log(`  ${student.enrollment_no} - ${student.first_name} ${student.last_name}: ${attendanceCheck.rows[0].count} attendance records`);
      }
    }
    
    console.log(`\nTotal Section B students: ${allSectionB.rows.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkHighEnrollmentB();
