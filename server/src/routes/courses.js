const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/courses
router.get('/', authenticate, async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = `
      SELECT c.*, sc.name as class_name, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name 
      FROM courses c 
      JOIN school_classes sc ON sc.id = c.class_id
      LEFT JOIN users u ON u.id = c.teacher_id
    `;
    const params = [];

    if (class_id) {
      params.push(class_id);
      query += ` WHERE c.class_id = $1`;
    }
    
    query += ' ORDER BY c.name';

    const result = await db.query(query, params);
    res.json({ courses: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/courses
router.post('/', authenticate, can('create courses'), async (req, res) => {
  try {
    const { name, code, class_id } = req.body;
    const result = await db.query(
      'INSERT INTO courses (name, code, class_id) VALUES ($1, $2, $3) RETURNING *',
      [name, code, class_id]
    );
    res.status(201).json({ message: 'Course created.', course: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', authenticate, can('edit courses'), async (req, res) => {
  try {
    const { name, code } = req.body;
    await db.query(
      'UPDATE courses SET name = $1, code = $2, updated_at = NOW() WHERE id = $3',
      [name, code, req.params.id]
    );
    res.json({ message: 'Course updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
