const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/ai/generate-timetable
 * Generates a conflict-free timetable using Gemini AI
 */
router.post('/generate-timetable', authenticate, can('create routines'), async (req, res) => {
  try {
    const { class_id, section_id, session_id, constraints } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        message: 'Gemini API Key is missing. Please add GEMINI_API_KEY to your server .env file.' 
      });
    }

    // 1. Fetch courses and teachers for this class
    const coursesResult = await db.query(
      `SELECT c.id, c.name, c.code, u.first_name, u.last_name 
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       WHERE c.class_id = $1`,
      [class_id]
    );

    const courses = coursesResult.rows;

    if (courses.length === 0) {
      return res.status(400).json({ message: 'No courses found for this class. Please add courses first.' });
    }

    // 2. Construct the prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert academic scheduler. Generate a conflict-free weekly timetable for a college class based on the following data:
      
      Class ID: ${class_id}
      Section ID: ${section_id}
      Session ID: ${session_id}
      
      Courses available:
      ${courses.map(c => `- ID: ${c.id}, Name: ${c.name}, Teacher: ${c.first_name} ${c.last_name}`).join('\n')}
      
      Configuration/Constraints:
      - Weekdays: Monday to Friday
      - Standard class duration: 1 hour
      - Daily start time: 09:00
      - Daily end time: 16:00
      - Lunch break: 12:00 to 13:00 (No classes)
      - Each course should appear at least 3 times a week but no more than 5.
      - Additional constraints: ${constraints || 'None'}
      
      Output MUST be a valid JSON array of objects. Each object must have these EXACT keys:
      - day_of_week: (One of: Monday, Tuesday, Wednesday, Thursday, Friday)
      - start_time: (HH:MM format, e.g., "09:00")
      - end_time: (HH:MM format, e.g., "10:00")
      - course_id: (Integer ID from the list above)
      - course_name: (String name from the list above)
      - room_no: (Randomly assign room numbers like "Room 101", "Lab A", "Seminar Hall" etc.)

      Return ONLY the JSON array. Do not include any markdown or extra text.
    `;

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response (Gemini sometimes adds markdown code blocks)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const timetable = JSON.parse(text);

    res.json({ 
      message: 'Timetable generated successfully', 
      timetable 
    });

  } catch (err) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate timetable.', error: err.message });
  }
});

/**
 * POST /api/ai/save-timetable
 * Bulk saves the generated timetable to the database
 */
router.post('/save-timetable', authenticate, can('create routines'), async (req, res) => {
  const client = await db.connect();
  try {
    const { class_id, section_id, session_id, timetable } = req.body;

    await client.query('BEGIN');

    // Optional: Clear existing routines for this class/section
    await client.query(
      'DELETE FROM routines WHERE class_id = $1 AND section_id = $2 AND session_id = $3',
      [class_id, section_id, session_id]
    );

    // Insert new routines
    for (const entry of timetable) {
      await client.query(
        `INSERT INTO routines (class_id, section_id, session_id, course_id, day_of_week, start_time, end_time, room_no)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [class_id, section_id, session_id, entry.course_id, entry.day_of_week, entry.start_time, entry.end_time, entry.room_no]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Timetable saved successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Save Timetable Error:', err);
    res.status(500).json({ message: 'Failed to save timetable.', error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
