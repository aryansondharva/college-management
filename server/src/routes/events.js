const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/events
router.get('/', authenticate, async (req, res) => {
  try {
    const { start, end, session_id } = req.query;
    let query = `SELECT id, title, start_date as start, end_date as end, 
                 COALESCE(type, 'other') as type
                 FROM events WHERE session_id = $1`;
    const params = [session_id];

    if (start && end) {
      params.push(start, end);
      query += ` AND start_date >= $2 AND end_date <= $3`;
    }

    query += ' ORDER BY start_date ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/events  (handles create / edit / delete via 'type' body field)
router.post('/', authenticate, can('manage events'), async (req, res) => {
  try {
    const { title, start, end, session_id, type, id, description } = req.body;

    if (type === 'create') {
      const eventType = req.body.eventType || 'other';
      const result = await db.query(
        `INSERT INTO events (title, start_date, end_date, session_id, type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, start_date as start, end_date as end, type`,
        [title, start, end, session_id, eventType]
      );
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'edit') {
      const result = await db.query(
        `UPDATE events SET title = $1, start_date = $2, end_date = $3
         WHERE id = $4
         RETURNING id, title, start_date as start, end_date as end, type`,
        [title, start, end, id]
      );
      return res.json(result.rows[0]);
    }

    if (type === 'delete') {
      await db.query('DELETE FROM events WHERE id = $1', [id]);
      return res.json({ message: 'Event deleted.' });
    }

    res.status(400).json({ message: 'Invalid operation type.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
