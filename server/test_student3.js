const db = require('./src/config/database');
const student_id = 2;

Promise.all([
    db.query(`
        SELECT 
            c.id as course_id,
            c.name as subject_name,
            EXTRACT(MONTH FROM a.attendance_date) as month,
            EXTRACT(YEAR FROM a.attendance_date) as year,
            COUNT(a.id) FILTER (WHERE a.present = true) as attended,
            COUNT(a.id) as total
        FROM courses c
        JOIN attendances a ON a.course_id = c.id
        WHERE a.student_id = $1
        GROUP BY c.id, c.name, month, year
        ORDER BY year DESC, month DESC, c.name ASC
    `, [student_id]),
    db.query(`
        SELECT 
            COUNT(*) FILTER (WHERE present = true) as attended,
            COUNT(*) as total
        FROM attendances
        WHERE student_id = $1 AND course_id IS NOT NULL
    `, [student_id])
])
.then(([monthlyResult, summaryResult]) => {
    console.log("Monthly rows:", monthlyResult.rows);
    console.log("Summary rows:", summaryResult.rows);
    process.exit(0);
})
.catch(e => {
    console.error("DB Query Error:", e);
    process.exit(1);
});
