const db = require('./src/config/database');
async function addIndex() {
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON attendances (student_id, attendance_date, COALESCE(course_id, 0))");
  console.log("Functional unique index added.");
  process.exit();
}
addIndex();
