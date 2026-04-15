require('dotenv').config();
const db = require('./src/config/database');

async function migrate() {
  try {
    console.log('Adding new_password column to activity_logs...');
    await db.query(`
      ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS new_password VARCHAR(255);
    `);
    console.log('new_password column added successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
