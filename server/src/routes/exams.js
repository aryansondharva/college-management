const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/exams
router.get('/', authenticate, async (req, res) => {
  try {
    const { session_id, class_id, semester_id } = req.query;
    let query = 'SELECT * FROM exams WHERE session_id = $1';
    const params = [session_id];
    
    if (class_id && class_id !== '0') {
      params.push(class_id);
      query += ` AND class_id = $${params.length}`;
    }
    if (semester_id && semester_id !== '0') {
      params.push(semester_id);
      query += ` AND semester_id = $${params.length}`;
    }
    
    const result = await db.query(query, params);
    res.json({ exams: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/exams
router.post('/', authenticate, can('create exams'), async (req, res) => {
  try {
    const { name, class_id, session_id, semester_id, start_date, end_date } = req.body;
    const result = await db.query(
      'INSERT INTO exams (name, class_id, session_id, semester_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, class_id, session_id, semester_id, start_date, end_date]
    );
    res.status(201).json({ message: 'Exam created.', exam: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/exams/:id
router.delete('/:id', authenticate, can('delete exams'), async (req, res) => {
  try {
    await db.query('DELETE FROM exams WHERE id = $1', [req.params.id]);
    res.json({ message: 'Exam deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// === EXAM RULES ===

// GET /api/exams/rules
router.get('/rules', authenticate, async (req, res) => {
  try {
    const { exam_id } = req.query;
    const result = await db.query('SELECT * FROM exam_rules WHERE exam_id = $1', [exam_id]);
    res.json({ exam_rules: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/exams/rules
router.post('/rules', authenticate, can('create exam rules'), async (req, res) => {
  try {
    const { exam_id, total_marks, pass_marks, credit_hours } = req.body;
    const result = await db.query(
      'INSERT INTO exam_rules (exam_id, total_marks, pass_marks, credit_hours) VALUES ($1, $2, $3, $4) RETURNING *',
      [exam_id, total_marks, pass_marks, credit_hours]
    );
    res.status(201).json({ message: 'Exam rule created.', exam_rule: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/exams/rules/:id
router.put('/rules/:id', authenticate, can('edit exam rules'), async (req, res) => {
  try {
    const { total_marks, pass_marks, credit_hours } = req.body;
    const result = await db.query(
      'UPDATE exam_rules SET total_marks = $1, pass_marks = $2, credit_hours = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [total_marks, pass_marks, credit_hours, req.params.id]
    );
    res.json({ message: 'Exam rule updated.', exam_rule: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
