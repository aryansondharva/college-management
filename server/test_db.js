const db = require('./src/config/database');
require('dotenv').config();

async function check() {
  try {
    const sessionResult = await db.query('SELECT * FROM school_sessions');
    console.log("Sessions:", sessionResult.rows);

    const classResult = await db.query('SELECT * FROM school_classes');
    console.log("Classes Count:", classResult.rows.length);
    console.log("First 5 Classes:", classResult.rows.slice(0, 5));

    const sectionResult = await db.query('SELECT * FROM sections');
    console.log("Sections Count:", sectionResult.rows.length);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
