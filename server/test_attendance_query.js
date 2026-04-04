const db = require('./src/config/database');

async function run() {
    const s = await db.query("SELECT id FROM users WHERE enrollment_no = '251100107001'");
    const sid = s.rows[0].id;
    console.log('student_id:', sid);

    const sai = await db.query('SELECT * FROM student_academic_infos WHERE student_id = $1', [sid]);
    const { class_id, session_id } = sai.rows[0];
    console.log('class_id:', class_id, 'session_id:', session_id);

    // EXACT same query as admin overall-report
    const r = await db.query(
        'SELECT a.course_id, COUNT(*) FILTER (WHERE a.present = true) as attended, COUNT(*) as total FROM attendances a WHERE a.session_id = $1 AND a.class_id = $2 AND a.student_id = $3 GROUP BY a.course_id',
        [session_id, class_id, sid]
    );
    console.log('Attendance by course_id:', JSON.stringify(r.rows, null, 2));

    const courses = await db.query('SELECT id, name, code FROM courses WHERE class_id = $1 ORDER BY id', [class_id]);
    console.log('Courses:', JSON.stringify(courses.rows, null, 2));

    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
