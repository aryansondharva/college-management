
const db = require('../src/config/database');
require('dotenv').config();

async function migrateToMultipleAttachments() {
  try {
    // 1. Add jsonb column
    await db.query(`
      ALTER TABLE assignments 
      ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `);
    
    // 2. Migrate existing single attachment if any
    await db.query(`
      UPDATE assignments 
      SET attachments = jsonb_build_array(jsonb_build_object('url', attachment_url, 'type', attachment_type, 'name', 'Attachment'))
      WHERE attachment_url IS NOT NULL AND (attachments IS NULL OR jsonb_array_length(attachments) = 0);
    `);

    console.log('✅ Migrated assignments table to support multiple attachments.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateToMultipleAttachments();
