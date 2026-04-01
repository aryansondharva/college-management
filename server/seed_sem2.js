const db = require('./src/config/database');

async function setupSem2Subjects() {
  try {
    const sessionRes = await db.query("SELECT id FROM school_sessions WHERE session = '2025-26 EVEN' LIMIT 1");
    if (sessionRes.rows.length === 0) {
       console.log("Session not found");
       return;
    }
    const sessionId = sessionRes.rows[0].id;

    const classRes = await db.query("SELECT id FROM school_classes WHERE name LIKE '%1st Year%' OR name LIKE '%1st sem%' LIMIT 1");
    let classId = classRes.rows.length > 0 ? classRes.rows[0].id : 1; 

    const subjects = [
      { name: 'Maths-II', code: 'BE02000011' },
      { name: 'Basic Mechanical Engineering', code: 'BE01000081' },
      { name: 'Programming for Problem Solving', code: 'BE01000121' },
      { name: 'Fundamental of AI', code: 'BE02000041' },
      { name: 'Design Thinking', code: 'BE01R00071' },
      { name: 'Digital Fabrication Workshop', code: 'BE01000181' },
      { name: 'English for Technical Communication', code: 'BE02000021' }
    ];

    for (const sub of subjects) {
      await db.query(`
        INSERT INTO courses (name, code, class_id) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (code) DO NOTHING`, 
        [sub.name, sub.code, classId]
      );
    }
    console.log("Semester 2 subjects added successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

setupSem2Subjects();
