const db = require('./src/config/database');
async function queryCourses() {
  const res = await db.query("SELECT * FROM courses");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
queryCourses();
