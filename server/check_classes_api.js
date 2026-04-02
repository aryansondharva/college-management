const db = require('./src/config/database');

async function checkClassesAPI() {
  try {
    // Simulate the exact API call that frontend makes for classes
    const currentSession = 3; // 2025-26 EVEN
    
    const result = await db.query(`
      SELECT c.*, s.session
      FROM school_classes c
      JOIN school_sessions s ON s.id = c.session_id
      WHERE c.session_id = $1
      ORDER BY c.numeric_name, c.name
    `, [currentSession]);
    
    console.log('Classes returned by API for current session:');
    result.rows.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.name}, Numeric Name: ${c.numeric_name || 'NULL'}, Session: ${c.session}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkClassesAPI();
