const db = require('./src/config/database');
async function listSessions() {
  const res = await db.query("SELECT * FROM school_sessions");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
listSessions();
