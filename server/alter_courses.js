const db = require('./src/config/database');
async function alterSchema() {
  await db.query("ALTER TABLE courses ADD CONSTRAINT courses_code_unique UNIQUE (code)");
  console.log("Constraint added.");
  process.exit();
}
alterSchema();
