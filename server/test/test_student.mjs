import db from './src/db/index.js';
db.query("SELECT u.id, u.first_name, sai.class_id, sai.session_id FROM users u LEFT JOIN student_academic_infos sai ON u.id = sai.student_id WHERE u.first_name ILIKE '%Aryan%'")
    .then(r => {
        console.log("Aryans:", r.rows);
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
