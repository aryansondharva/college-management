const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/sections
router.get('/', authenticate, async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = 'SELECT s.*, c.name as class_name FROM sections s JOIN school_classes c ON c.id = s.class_id';
    const params = [];

    if (class_id) {
      params.push(class_id);
      query += ` WHERE s.class_id = $1`;
    }
    
    query += ' ORDER BY s.name';

    const result = await db.query(query, params);
    res.json({ sections: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/sections
router.post('/', authenticate, can('create sections'), async (req, res) => {
  try {
    const { name, class_id } = req.body;
    const result = await db.query(
      'INSERT INTO sections (name, class_id) VALUES ($1, $2) RETURNING *',
      [name, class_id]
    );
    res.status(201).json({ message: 'Section created.', section: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/sections/:id
router.put('/:id', authenticate, can('edit sections'), async (req, res) => {
  try {
    const { name } = req.body;
    await db.query(
      'UPDATE sections SET name = $1, updated_at = NOW() WHERE id = $2',
      [name, req.params.id]
    );
    res.json({ message: 'Section updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
