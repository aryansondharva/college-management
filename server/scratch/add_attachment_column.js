
const db = require('../src/config/database');
require('dotenv').config();

async function addAttachmentColumn() {
  try {
    await db.query(`
      ALTER TABLE assignments 
      ADD COLUMN IF NOT EXISTS attachment_url TEXT,
      ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);
    `);
    console.log('✅ Added attachment columns to assignments table.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding columns:', err);
    process.exit(1);
  }
}

addAttachmentColumn();
