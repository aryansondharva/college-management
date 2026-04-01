const db = require('./src/config/database');
async function checkAttendanceTable() {
  const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%attendance%'");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
checkAttendanceTable();
