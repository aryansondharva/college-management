const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/classes
router.get('/', authenticate, async (req, res) => {
  try {
    const { session_id } = req.query;
    let query = 'SELECT * FROM school_classes';
    const params = [];

    if (session_id) {
      params.push(session_id);
      query += ` WHERE session_id = $1`;
    }
    
    query += ' ORDER BY name';

    const result = await db.query(query, params);
    res.json({ classes: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/classes
router.post('/', authenticate, can('create classes'), async (req, res) => {
  try {
    const { name, numeric_name, session_id } = req.body;
    const result = await db.query(
      'INSERT INTO school_classes (name, numeric_name, session_id) VALUES ($1, $2, $3) RETURNING *',
      [name, numeric_name, session_id]
    );
    res.status(201).json({ message: 'Class created.', class: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/classes/:id
router.put('/:id', authenticate, can('edit classes'), async (req, res) => {
  try {
    const { name, numeric_name } = req.body;
    await db.query(
      'UPDATE school_classes SET name = $1, numeric_name = $2, updated_at = NOW() WHERE id = $3',
      [name, numeric_name, req.params.id]
    );
    res.json({ message: 'Class updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
