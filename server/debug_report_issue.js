const db = require('./src/config/database');

async function debugReportIssue() {
  try {
    console.log('Debugging Comprehensive Attendance Report issue...\n');
    
    // Test the exact query that /attendance/report uses
    console.log('1. Testing exact /attendance/report query:');
    const monthlyReport = await db.query(`
      SELECT 
                a.student_id, 
                u.first_name, u.last_name, u.enrollment_no,
                a.course_id, 
                COUNT(*) FILTER (WHERE a.present = true) as attended,
                COUNT(*) as total
            FROM attendances a
            JOIN users u ON u.id = a.student_id
            WHERE a.session_id = 3 AND a.class_id = 21 AND a.section_id = 41
              AND EXTRACT(MONTH FROM a.attendance_date) = 4
              AND EXTRACT(YEAR FROM a.attendance_date) = 2026
            GROUP BY a.student_id, u.first_name, u.last_name, u.enrollment_no, a.course_id
            ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
            LIMIT 15
    `);
    
    console.log('First 15 students from monthly report:');
    monthlyReport.rows.forEach(r => {
      console.log(`  ${r.enrollment_no || 'No Enrollment'} - ${r.first_name} ${r.last_name}`);
    });
    
    // Check if there are any students with enrollment numbers starting from 251100107072 onwards
    console.log('\n2. Checking for students with enrollment 251100107072 onwards:');
    const highEnrollmentStudents = monthlyReport.rows.filter(r => 
      r.enrollment_no && parseInt(r.enrollment_no) >= 251100107072
    );
    
    console.log(`Students with enrollment >= 251100107072: ${highEnrollmentStudents.length}`);
    highEnrollmentStudents.forEach(r => {
      console.log(`  ${r.enrollment_no} - ${r.first_name} ${r.last_name}`);
    });
    
    // Let's also check all students in Section A to see the actual enrollment range
    console.log('\n3. Checking all students in Section A:');
    const allStudents = await db.query(`
      SELECT u.first_name, u.last_name, u.enrollment_no
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      WHERE u.role = 'student' AND sai.session_id = 3 AND sai.class_id = 21 AND sai.section_id = 41
      ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
      LIMIT 20
    `);
    
    console.log('First 20 students in Section A (all):');
    allStudents.rows.forEach(s => {
      console.log(`  ${s.enrollment_no || 'No Enrollment'} - ${s.first_name} ${s.last_name}`);
    });
    
    // Check the actual enrollment number range
    const enrollmentNumbers = allStudents.rows
      .filter(s => s.enrollment_no)
      .map(s => parseInt(s.enrollment_no))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    if (enrollmentNumbers.length > 0) {
      console.log(`\nEnrollment number range: ${enrollmentNumbers[0]} to ${enrollmentNumbers[enrollmentNumbers.length - 1]}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debugReportIssue();
