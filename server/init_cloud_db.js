// Initialize cloud database with basic structure
const { Pool } = require('pg');

const cloudPool = new Pool({
  connectionString: 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres'
});

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing cloud database...');
    
    // Test connection
    await cloudPool.query('SELECT 1');
    console.log('✅ Connected to cloud database!');
    
    // Create basic tables (you can expand this)
    const createTables = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        enrollment_no VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS attendances (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        session_id INTEGER,
        class_id INTEGER,
        section_id INTEGER,
        course_id INTEGER,
        attendance_date DATE NOT NULL,
        present BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS school_sessions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true
      );
      
      CREATE TABLE IF NOT EXISTS school_classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        session_id INTEGER REFERENCES school_sessions(id)
      );
      
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        class_id INTEGER REFERENCES school_classes(id)
      );
      
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS student_academic_infos (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        session_id INTEGER REFERENCES school_sessions(id),
        class_id INTEGER REFERENCES school_classes(id),
        section_id INTEGER REFERENCES sections(id),
        UNIQUE(student_id, session_id)
      );
    `;
    
    await cloudPool.query(createTables);
    console.log('✅ Database tables created!');
    
    console.log('🎯 Cloud database is ready for production!');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
  } finally {
    await cloudPool.end();
  }
}

initializeDatabase();
