const db = require('./src/config/database');

async function migrate() {
  try {
    console.log('🚀 Running migration for push notifications...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS push_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, token)
      );
    `;
    
    await db.query(createTableQuery);
    console.log('✅ push_tokens table created/verified!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
