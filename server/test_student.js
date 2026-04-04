const db = require('./src/config/database');
db.query("SELECT * FROM attendances LIMIT 1")
    .then(r => {
        console.log("Attendances limit 1:", r.rows);
        return db.query("SELECT * FROM student_academic_infos WHERE student_id = (SELECT id FROM users WHERE first_name ILIKE '%Aryan%' LIMIT 1)");
    })
    .then(r => {
        console.log("Aryan's Academic Info:", r.rows);
        process.exit(0);
    })
    .catch(e => {
        console.error("DB Error:", e);
        process.exit(1);
    });
