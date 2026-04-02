const db = require('./src/config/database');

async function checkAllClasses() {
  try {
    const currentSession = 3; // 2025-26 EVEN
    
    const result = await db.query(`
      SELECT c.*, s.session
      FROM school_classes c
      JOIN school_sessions s ON s.id = c.session_id
      WHERE c.session_id = $1
      ORDER BY c.id
    `, [currentSession]);
    
    console.log('ALL classes in current session:');
    result.rows.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.name}, Numeric Name: ${c.numeric_name || 'NULL'}`);
    });
    
    // Check specifically for Sem-2 classes
    console.log('\nSem-2 classes in current session:');
    const sem2Classes = result.rows.filter(c => c.name.toLowerCase().includes('sem-2'));
    sem2Classes.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.name}, Numeric Name: ${c.numeric_name || 'NULL'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAllClasses();
