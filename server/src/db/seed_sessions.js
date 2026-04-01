const db = require('../config/database');
require('dotenv').config();

async function seedSessions() {
  try {
    console.log("Seeding Academic Sessions...");
    
    const sessions = [
      { name: '2025-26 ODD', current: false },
      { name: '2025-26 EVEN', current: true },
      { name: '2026-27 ODD', current: false },
      { name: '2026-27 EVEN', current: false }
    ];

    // Important: Reset all 'current' sessions first to avoid duplicates
    await db.query('UPDATE school_sessions SET current = FALSE');

    for (const session of sessions) {
      // Check if session exists
      const check = await db.query('SELECT id FROM school_sessions WHERE session = $1', [session.name]);
      
      if (check.rows.length === 0) {
        await db.query(
          'INSERT INTO school_sessions (session, current) VALUES ($1, $2)',
          [session.name, session.current]
        );
        console.log(`Created Session: ${session.name} ${session.current ? '(CURRENT)' : ''}`);
      } else {
        await db.query('UPDATE school_sessions SET current = $1 WHERE session = $2', [session.current, session.name]);
        console.log(`Updated Session: ${session.name} ${session.current ? '(CURRENT)' : ''}`);
      }
    }

    console.log("Session seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Session seeding failed:", err);
    process.exit(1);
  }
}

seedSessions();
