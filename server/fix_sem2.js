const db = require('./src/config/database');

async function fixSem2Subjects() {
  try {
    const classesRes = await db.query("SELECT id FROM school_classes WHERE name ILIKE '%2nd sem%' OR name ILIKE '%2nd year%'");
    const classIds = classesRes.rows.map(c => c.id);
    console.log(`Found ${classIds.length} classes for 2nd Sem: ${classIds.join(',')}`);

    const subjects = [
      { name: 'Maths-II', code: 'BE02000011' },
      { name: 'Basic Mechanical Engineering', code: 'BE01000081' },
      { name: 'Programming for Problem Solving', code: 'BE01000121' },
      { name: 'Fundamental of AI', code: 'BE02000041' },
      { name: 'Design Thinking', code: 'BE01R00071' },
      { name: 'Digital Fabrication Workshop', code: 'BE01000181' },
      { name: 'English for Technical Communication', code: 'BE02000021' }
    ];

    for (const classId of classIds) {
      for (const sub of subjects) {
        // Use a composite key or just try insert
        await db.query(`
          INSERT INTO courses (name, code, class_id) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (code, class_id) DO NOTHING`, 
          [sub.name, sub.code, classId]
        );
      }
    }
    console.log("Semester 2 subjects updated across ALL relevant classes.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fixSem2Subjects();
