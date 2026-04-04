const express = require('express');
const db = require('./src/config/database');

// Simulate the exact frontend call
async function testFrontendCall() {
  try {
    // This simulates the filters object from frontend
    const filters = {
      session_id: '3',    // Current session
      class_id: '2',      // Sem-2
      section_id: '3',    // Section A
      course_id: '',      // Empty course_id (this might be the issue)
      date: '2025-04-02'  // Today's date
    };
    
    console.log('Frontend filters:', filters);
    
    // Test the exact query that /users/students endpoint would execute
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.gender, u.photo, u.role, u.enrollment_no,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student'
    `;
    const params = [];
    
    if (filters.session_id) { 
      params.push(filters.session_id); 
      query += ` AND sai.session_id = $${params.length}`; 
    }
    if (filters.class_id && filters.class_id !== '0') { 
      params.push(filters.class_id); 
      query += ` AND sai.class_id = $${params.length}`; 
    }
    if (filters.section_id && filters.section_id !== '0') { 
      params.push(filters.section_id); 
      query += ` AND sai.section_id = $${params.length}`; 
    }
    query += ' ORDER BY u.first_name';

    console.log('\nQuery with filters:', query);
    console.log('Parameters:', params);
    
    const result = await db.query(query, params);
    console.log('Students returned:', result.rows.length);
    
    // Also test with empty string values (like what might be happening)
    const filters2 = {
      session_id: '3',
      class_id: '2', 
      section_id: '3',
      course_id: '',      // This might be causing issues
      date: '2025-04-02'
    };
    
    console.log('\n--- Testing with empty course_id ---');
    console.log('filters.course_id value:', JSON.stringify(filters2.course_id));
    console.log('filters.course_id !== "0":', filters2.course_id !== '0');
    console.log('filters.course_id && filters2.course_id !== "0":', filters2.course_id && filters2.course_id !== '0');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testFrontendCall();
