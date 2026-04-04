const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

// Using the Supabase connection from your full_migration.js
const cloudPool = new Pool({
  connectionString: 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres'
});

async function runProductionFix() {
  try {
    console.log('🔄 Starting Production Database Fix...');

    // 1. Add course_id column if it doesn't exist
    console.log('📄 Adding course_id column to attendances table...');
    await cloudPool.query(`
      ALTER TABLE attendances 
      ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE
    `);

    // 2. Add updated_at column if it doesn't exist
    console.log('📄 Adding updated_at column to attendances table...');
    await cloudPool.query(`
      ALTER TABLE attendances 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // 3. Create the UNIQUE INDEX required for ON CONFLICT logic
    console.log('📄 Creating unique index unique_attendance_idx...');
    // We drop existing simple unique index if it exists to replace it with the COALESCE one
    try {
        await cloudPool.query('DROP INDEX IF EXISTS unique_attendance_idx');
    } catch (e) {
        console.log('ℹ️   Old index not found, continuing...');
    }
    
    await cloudPool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_idx 
      ON attendances (student_id, attendance_date, COALESCE(course_id, 0))
    `);

    console.log('✅ PRODUCTION FIX APPLIED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Production fix failed:', error);
  } finally {
    await cloudPool.end();
  }
}

runProductionFix();
