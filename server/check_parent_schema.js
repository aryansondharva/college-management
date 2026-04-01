const db = require('./src/config/database');
(async () => {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_parent_infos'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
