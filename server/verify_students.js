const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const cloudPool = new Pool({
  connectionString: 'postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres'
});

async function verifyStudents() {
  try {
    console.log('🔍 Checking student records in the range 251100107001 to 251100107142...');

    const result = await cloudPool.query(`
      SELECT u.id, u.enrollment_no, u.first_name, u.last_name, 
             sai.session_id, sai.class_id, sai.section_id
      FROM users u
      LEFT JOIN student_academic_infos sai ON u.id = sai.student_id
      WHERE u.enrollment_no >= '251100107001' AND u.enrollment_no <= '251100107142'
      ORDER BY u.enrollment_no ASC
    `);

    console.log(`📊 Found ${result.rows.length} students total.`);

    const incomplete = result.rows.filter(r => !r.session_id || !r.class_id);
    if (incomplete.length > 0) {
      console.log(`⚠️  WARNING: ${incomplete.length} students have incomplete academic data!`);
      console.log('Sample of incomplete records:', incomplete.slice(0, 5).map(r => r.enrollment_no));
    } else {
      console.log('✅ All students in the range have complete academic data.');
    }

    // Check if there are duplicate enrollment numbers
    const counts = {};
    result.rows.forEach(r => counts[r.enrollment_no] = (counts[r.enrollment_no] || 0) + 1);
    const duplicates = Object.keys(counts).filter(k => counts[k] > 1);
    if (duplicates.length > 0) {
      console.log('❌ ERROR: Duplicate enrollment numbers found:', duplicates);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await cloudPool.end();
  }
}

verifyStudents();
