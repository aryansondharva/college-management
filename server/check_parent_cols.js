const db = require('./src/config/database');
(async () => {
  try {
    const res = await db.query("SELECT * FROM student_parent_infos LIMIT 1");
    console.log(Object.keys(res.rows[0] || {}));
    process.exit(0);
  } catch (err) {
    console.log("Empty or error: ", err.message);
    const res2 = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'student_parent_infos'");
    console.log(res2.rows.map(r => r.column_name));
    process.exit(0);
  }
})();
