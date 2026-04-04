const db = require('./src/config/database');
const student_id = 2; // Aryan

Promise.all([
    db.query(`
        SELECT 
            c.id as course_id,
            c.name as subject_name,
            c.code as subject_code,
            COUNT(a.id) FILTER (WHERE a.present = true) as attended,
            COUNT(a.id) as total
        FROM courses c
        JOIN student_academic_infos sai ON sai.class_id = c.class_id
        LEFT JOIN attendances a ON a.course_id = c.id AND a.student_id = $1
        WHERE sai.student_id = $1
        GROUP BY c.id, c.name, c.code
    `, [student_id]),
    db.query(`SELECT * FROM courses WHERE class_id = 21`)
])
.then(([overallResult, coursesResult]) => {
    console.log("Overall Rows returned:", overallResult.rows.length);
    console.log("Courses in Class 21:", coursesResult.rows.length);
    process.exit(0);
})
.catch(e => {
    console.error(e);
    process.exit(1);
});
