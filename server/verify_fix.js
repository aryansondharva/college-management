const db = require('./src/config/database');
async function verify() {
  const res = await db.query("SELECT COUNT(*) FROM courses WHERE class_id = 21");
  console.log(`Class 21 has ${res.rows[0].count} subjects.`);
  process.exit();
}
verify();
