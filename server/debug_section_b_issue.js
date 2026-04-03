const db = require('./src/config/database');

async function debugSectionBIssue() {
  try {
    console.log('Debugging Section B enrollment number issue...\n');
    
    // Check what Section B actually has
    console.log('1. All students in Section B:');
    const sectionBStudents = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.enrollment_no
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      WHERE u.role = 'student' AND sai.session_id = 3 AND sai.class_id = 21 AND sai.section_id = 42
      ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
      LIMIT 15
    `);
    
    console.log('Section B students (first 15):');
    sectionBStudents.rows.forEach(s => {
      console.log(`  ${s.enrollment_no || 'No Enrollment'} - ${s.first_name} ${s.last_name} (ID: ${s.id})`);
    });
    
    // Check what API is returning for Section B
    console.log('\n2. What /attendance/report returns for Section B:');
    const sectionBReport = await db.query(`
      SELECT 
                a.student_id, 
                u.first_name, u.last_name, u.enrollment_no,
                a.course_id, 
                COUNT(*) FILTER (WHERE a.present = true) as attended,
                COUNT(*) as total
            FROM attendances a
            JOIN users u ON u.id = a.student_id
            WHERE a.session_id = 3 AND a.class_id = 21 AND a.section_id = 42
              AND EXTRACT(MONTH FROM a.attendance_date) = 4
              AND EXTRACT(YEAR FROM a.attendance_date) = 2026
            GROUP BY a.student_id, u.first_name, u.last_name, u.enrollment_no, a.course_id
            ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
            LIMIT 15
    `);
    
    console.log('Section B report (first 15):');
    sectionBReport.rows.forEach(r => {
      console.log(`  ${r.enrollment_no || 'No Enrollment'} - ${r.first_name} ${r.last_name} (ID: ${r.student_id})`);
    });
    
    // Check if there are any students with enrollment >= 251100107105 in Section B
    console.log('\n3. Checking for students with enrollment >= 251100107105:');
    const highEnrollmentStudents = sectionBStudents.rows.filter(s => 
      s.enrollment_no && parseInt(s.enrollment_no) >= 251100107105
    );
    
    console.log(`Students with enrollment >= 251100107105: ${highEnrollmentStudents.length}`);
    highEnrollmentStudents.forEach(s => {
      console.log(`  ${s.enrollment_no} - ${s.first_name} ${s.last_name}`);
    });
    
    // Check if there are any students with enrollment 251100107072-251100107104 in Section B
    console.log('\n4. Checking for students with enrollment 251100107072-251100107104:');
    const expectedRangeStudents = sectionBStudents.rows.filter(s => 
      s.enrollment_no && parseInt(s.enrollment_no) >= 251100107072 && parseInt(s.enrollment_no) <= 251100107104
    );
    
    console.log(`Students with enrollment 251100107072-251100107104: ${expectedRangeStudents.length}`);
    expectedRangeStudents.forEach(s => {
      console.log(`  ${s.enrollment_no} - ${s.first_name} ${s.last_name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debugSectionBIssue();
