const db = require('./src/config/database');
async function checkCols() {
  const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'attendances'");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
checkCols();
