
const db = require('../src/config/database');
require('dotenv').config();

async function syncSchema() {
  try {
    console.log('🔄 Syncing Supabase schema...');
    
    // Add columns
    await db.query(`
      ALTER TABLE assignments 
      ADD COLUMN IF NOT EXISTS attachment_url TEXT,
      ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `);
    
    console.log('✅ Supabase schema is now up to date.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema sync failed:', err);
    process.exit(1);
  }
}

syncSchema();
