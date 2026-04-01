const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/routines
router.get('/', authenticate, async (req, res) => {
  try {
    const { class_id, section_id, session_id } = req.query;
    const result = await db.query(
      `SELECT r.*, c.name as course_name 
       FROM routines r 
       LEFT JOIN courses c ON c.id = r.course_id
       WHERE r.class_id = $1 AND r.section_id = $2 AND r.session_id = $3
       ORDER BY r.weekday, r.start_time`,
      [class_id, section_id, session_id]
    );
    res.json({ routines: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/routines
router.post('/', authenticate, can('create routines'), async (req, res) => {
  try {
    const { class_id, section_id, session_id, course_id, weekday, start_time, end_time, room_number } = req.body;
    const result = await db.query(
      `INSERT INTO routines (class_id, section_id, session_id, course_id, weekday, start_time, end_time, room_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [class_id, section_id, session_id, course_id, weekday, start_time, end_time, room_number]
    );
    res.status(201).json({ message: 'Routine created.', routine: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/routines/:id
router.delete('/:id', authenticate, can('delete routines'), async (req, res) => {
  try {
    await db.query('DELETE FROM routines WHERE id = $1', [req.params.id]);
    res.json({ message: 'Routine deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
