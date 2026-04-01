const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/assignments
router.get('/', authenticate, async (req, res) => {
  try {
    const { class_id, course_id } = req.query;
    let query = 'SELECT * FROM assignments WHERE class_id = $1';
    const params = [class_id];

    if (course_id) {
       params.push(course_id);
       query += ` AND course_id = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json({ assignments: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/assignments
router.post('/', authenticate, can('create assignments'), async (req, res) => {
  try {
    const { title, description, class_id, course_id, deadline } = req.body;
    const result = await db.query(
      'INSERT INTO assignments (title, description, class_id, course_id, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, class_id, course_id, deadline]
    );
    res.status(201).json({ message: 'Assignment created successfully.', assignment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
