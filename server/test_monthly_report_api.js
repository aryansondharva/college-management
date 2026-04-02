const db = require('./src/config/database');

async function testMonthlyReportAPI() {
  try {
    console.log('Testing /attendance/report API response...\n');
    
    // Test the exact query that /attendance/report uses
    const result = await db.query(`
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
            LIMIT 20
    `);
    
    console.log('Raw API response (first 20 students):');
    result.rows.forEach((r, index) => {
      console.log(`${index + 1}. ${r.enrollment_no || 'No Enrollment'} - ${r.first_name} ${r.last_name}`);
    });
    
    // Check if any duplicate student_ids exist (which could cause ordering issues)
    const studentIds = result.rows.map(r => r.student_id);
    const uniqueIds = [...new Set(studentIds)];
    console.log(`\nTotal records: ${result.rows.length}, Unique student IDs: ${uniqueIds.length}`);
    
    if (studentIds.length !== uniqueIds.length) {
      console.log('⚠️  WARNING: Duplicate student IDs found!');
      const duplicates = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
      console.log('Duplicate IDs:', duplicates);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testMonthlyReportAPI();
