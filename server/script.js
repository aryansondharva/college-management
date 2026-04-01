const db = require('./src/config/database');

(async () => {
    try {
        const classRes = await db.query("SELECT * FROM school_classes WHERE name LIKE '%2nd Semester%'");
        const class_id = classRes.rows[0].id;
        console.log('Class ID:', class_id);

        const secRes = await db.query("SELECT * FROM sections WHERE class_id = $1 AND name = 'A'", [class_id]);
        const section_id = secRes.rows[0].id;
        console.log('Section ID:', section_id);

        const courseRes = await db.query("SELECT * FROM courses WHERE class_id = $1", [class_id]);
        const courses = courseRes.rows;
        
        console.log('Courses:', courses.map(c => ({ id: c.id, name: c.name })));

        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
})();
