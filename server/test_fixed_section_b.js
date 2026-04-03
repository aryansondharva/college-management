const db = require('./src/config/database');

async function testFixedSectionB() {
  try {
    console.log('Testing FIXED Section B report...\n');
    
    // Test the new approach - get all students first, then attendance
    const allStudents = await db.query(`
            SELECT u.id as student_id, u.first_name, u.last_name, u.enrollment_no
            FROM users u
            LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
            WHERE u.role = 'student' AND sai.session_id = 3 AND sai.class_id = 21 AND sai.section_id = 42
            ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = '' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC
            LIMIT 15
        `, []);
    
    console.log('All Section B students (first 15):');
    allStudents.rows.forEach(s => {
      console.log(`  ${s.enrollment_no || 'No Enrollment'} - ${s.first_name} ${s.last_name} (ID: ${s.student_id})`);
    });
    
    // Get attendance data for these students
    const attendanceData = await db.query(`
            SELECT 
                a.student_id, 
                a.course_id, 
                COUNT(*) FILTER (WHERE a.present = true) as attended,
                COUNT(*) as total
            FROM attendances a
            WHERE a.session_id = 3 AND a.class_id = 21 AND a.section_id = 42
              AND EXTRACT(MONTH FROM a.attendance_date) = 4
              AND EXTRACT(YEAR FROM a.attendance_date) = 2026
              AND a.student_id = ANY($1)
            GROUP BY a.student_id, a.course_id
        `, [allStudents.rows.map(s => s.student_id)]);
    
    console.log(`\nAttendance data found for ${attendanceData.rows.length} student-course combinations`);
    
    // Transform into expected format
    const report = {};
    allStudents.rows.forEach(student => {
        report[student.student_id] = {
            id: student.student_id,
            name: `${student.first_name} ${student.last_name}`,
            enrollment_no: student.enrollment_no,
            subjects: {}
        };
    });

    // Add attendance data
    attendanceData.rows.forEach(row => {
        if (report[row.student_id]) {
            report[row.student_id].subjects[row.course_id] = {
                attended: parseInt(row.attended),
                total: parseInt(row.total)
            };
        }
    });
    
    console.log('\nFinal report data:');
    const reportArray = Object.values(report);
    reportArray.slice(0, 15).forEach((student, index) => {
      const subjectCount = Object.keys(student.subjects).length;
      console.log(`${index + 1}. ${student.enrollment_no || 'No Enrollment'} - ${student.name} (${subjectCount} subjects)`);
    });
    
    console.log(`\nTotal students in report: ${reportArray.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testFixedSectionB();
