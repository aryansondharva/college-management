const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// ===== EXAMS =====

// GET /api/marks/exams
router.get('/exams', authenticate, async (req, res) => {
  try {
    const { session_id, class_id } = req.query;
    let query = 'SELECT * FROM exams WHERE session_id = $1';
    const params = [session_id];
    
    if (class_id && class_id !== '0') {
      params.push(class_id);
      query += ` AND class_id = $${params.length}`;
    }
    
    const result = await db.query(query, params);
    res.json({ exams: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/marks/exams
router.post('/exams', authenticate, can('create exams'), async (req, res) => {
  try {
    const { name, class_id, session_id, start_date, end_date } = req.body;
    const result = await db.query(
      'INSERT INTO exams (name, class_id, session_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, class_id, session_id, start_date, end_date]
    );
    res.status(201).json({ message: 'Exam created.', exam: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ===== MARKS =====

// GET /api/marks
router.get('/', authenticate, can('view marks'), async (req, res) => {
  try {
    const { session_id, class_id, section_id, course_id, exam_type } = req.query;
    
    const result = await db.query(
      `SELECT m.*, u.first_name, u.last_name 
       FROM marks m
       JOIN users u ON u.id = m.student_id
       WHERE m.session_id = $1 AND m.class_id = $2 AND m.section_id = $3 AND m.course_id = $4 AND m.exam_type = $5`,
      [session_id, class_id, section_id, course_id, exam_type]
    );
    res.json({ marks: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/marks
router.post('/', authenticate, can('save marks'), async (req, res) => {
  try {
    const { session_id, class_id, section_id, course_id, exam_type, marks_data } = req.body;
    // marks_data: [{student_id: 1, mark: 85}, ...]

    const queries = marks_data.map(item => {
      return db.query(
        `INSERT INTO marks (student_id, course_id, section_id, class_id, session_id, exam_type, mark)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (student_id, course_id, session_id, exam_type) DO UPDATE SET mark = $7, updated_at = NOW()`,
        [item.student_id, course_id, section_id, class_id, session_id, exam_type, item.mark]
      );
    });

    await Promise.all(queries);
    res.json({ message: 'Marks saved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
