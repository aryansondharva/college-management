const db = require('./src/config/database');
async function fixConstraint() {
  try {
     await db.query("ALTER TABLE courses DROP CONSTRAINT courses_code_unique");
     await db.query("ALTER TABLE courses ADD CONSTRAINT courses_code_class_unique UNIQUE (code, class_id)");
     console.log("Constraint updated to allow code reuse across different classes.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
fixConstraint();
