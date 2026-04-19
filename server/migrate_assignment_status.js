
const db = require('./src/config/database');

async function migrate() {
  try {
    console.log('🚀 Creating student_assignment_statuses table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_assignment_statuses (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, assignment_id)
      );
    `);
    console.log('✅ student_assignment_statuses table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
