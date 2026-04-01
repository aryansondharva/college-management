const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/notices
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.first_name, u.last_name 
       FROM notices n
       LEFT JOIN users u ON u.id = n.created_by
       ORDER BY n.created_at DESC`
    );
    res.json({ notices: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/notices
router.post('/', authenticate, can('create notices'), async (req, res) => {
  try {
    const { title, content, session_id } = req.body;
    // Combine title + content into the single 'notice' column
    const noticeText = title ? `**${title}**\n\n${content || ''}` : (content || '');
    const result = await db.query(
      'INSERT INTO notices (notice, session_id, created_by) VALUES ($1, $2, $3) RETURNING *',
      [noticeText, session_id || null, req.user.id]
    );
    res.status(201).json({ message: 'Notice posted.', notice: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/notices/:id
router.delete('/:id', authenticate, can('delete notices'), async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = $1', [req.params.id]);
    res.json({ message: 'Notice deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;

