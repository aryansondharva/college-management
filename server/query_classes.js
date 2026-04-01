const db = require('./src/config/database');
async function queryClasses() {
  const res = await db.query("SELECT * FROM school_classes");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
queryClasses();
