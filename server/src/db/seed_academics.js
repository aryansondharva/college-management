const db = require('../config/database');
require('dotenv').config();

async function seedAcademicsRefinement() {
  try {
    console.log("Refining Academics by Session Type (ODD vs EVEN)...");
    
    // Get all sessions
    const sessionRes = await db.query('SELECT id, session FROM school_sessions');
    if (sessionRes.rows.length === 0) {
      console.error("No sessions found. Run seed_sessions.js first.");
      process.exit(1);
    }

    const sessions = sessionRes.rows;

    for (const session of sessions) {
      const isOdd = session.session.toUpperCase().includes('ODD');
      const isEven = session.session.toUpperCase().includes('EVEN');

      if (!isOdd && !isEven) {
          console.log(`Skipping session: ${session.session} (Not ODD/EVEN)`);
          continue;
      }

      console.log(`\n--- Seeding for Session: ${session.session} ---`);

      // 1. Delete existing classes for this session to refine
      await db.query('DELETE FROM school_classes WHERE session_id = $1', [session.id]);

      const semesterConfigs = isOdd 
        ? [
            { name: '1st Semester', numeric: 1 },
            { name: '3rd Semester', numeric: 3 },
            { name: '5th Semester', numeric: 5 },
            { name: '7th Semester', numeric: 7 }
          ]
        : [
            { name: '2nd Semester', numeric: 2 },
            { name: '4th Semester', numeric: 4 },
            { name: '6th Semester', numeric: 6 },
            { name: '8th Semester', numeric: 8 }
          ];

      for (const sem of semesterConfigs) {
        // Insert Class
        const classRes = await db.query(
          'INSERT INTO school_classes (name, numeric_name, session_id) VALUES ($1, $2, $3) RETURNING id',
          [sem.name, sem.numeric, session.id]
        );
        const classId = classRes.rows[0].id;
        console.log(`Created: ${sem.name}`);

        // Insert Sections A and B
        for (const sectionName of ['A', 'B']) {
          await db.query('INSERT INTO sections (name, class_id) VALUES ($1, $2)', [sectionName, classId]);
          console.log(`  - Section ${sectionName}`);
        }
      }
    }

    console.log("\nAcademics refinement complete!");
    process.exit(0);
  } catch (err) {
    console.error("Refinement failed:", err);
    process.exit(1);
  }
}

seedAcademicsRefinement();
