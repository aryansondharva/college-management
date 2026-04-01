const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/sessions
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM school_sessions ORDER BY id DESC');
    res.json({ sessions: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/sessions/current
router.get('/current', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM school_sessions WHERE current = true LIMIT 1');
    if (result.rows.length === 0) return res.status(404).json({ message: 'No current session.' });
    res.json({ session: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/sessions
router.post('/', authenticate, can('create school sessions'), async (req, res) => {
  try {
    const { session } = req.body;
    const result = await db.query(
      'INSERT INTO school_sessions (session, current) VALUES ($1, false) RETURNING *',
      [session]
    );
    // Create academic settings for new session
    await db.query(
      'INSERT INTO academic_settings (session_id) VALUES ($1)',
      [result.rows[0].id]
    );
    res.status(201).json({ message: 'Session created.', session: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/sessions/browse  (set as current session)
router.post('/browse', authenticate, can('update browse by session'), async (req, res) => {
  try {
    const { session_id } = req.body;
    await db.query('UPDATE school_sessions SET current = false');
    await db.query('UPDATE school_sessions SET current = true WHERE id = $1', [session_id]);
    res.json({ message: 'Current session updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/sessions/:id/semesters
router.get('/:id/semesters', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM semesters WHERE session_id = $1 ORDER BY id',
      [req.params.id]
    );
    res.json({ semesters: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/sessions/semester
router.post('/semester', authenticate, can('create semesters'), async (req, res) => {
  try {
    const { session_id, semester } = req.body;
    const result = await db.query(
      'INSERT INTO semesters (session_id, semester) VALUES ($1, $2) RETURNING *',
      [session_id, semester]
    );
    res.status(201).json({ message: 'Semester created.', semester: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
