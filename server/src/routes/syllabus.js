const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/syllabus/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/syllabus
router.get('/', authenticate, async (req, res) => {
  try {
    const { course_id, session_id } = req.query;
    let query = 'SELECT * FROM syllabi WHERE 1=1';
    const params = [];

    if (course_id) {
      params.push(course_id);
      query += ` AND course_id = $${params.length}`;
    }
    if (session_id) {
      params.push(session_id);
      query += ` AND session_id = $${params.length}`;
    }

    const result = await db.query(query, params);
    res.json({ syllabi: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/syllabus
router.post('/', authenticate, can('create syllabus'), upload.single('file'), async (req, res) => {
  try {
    const { syllabus_name, course_id, class_id, session_id } = req.body;
    const file_path = req.file ? req.file.path : null;

    const result = await db.query(
      `INSERT INTO syllabi (syllabus_name, course_id, class_id, session_id, file_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [syllabus_name, course_id, class_id, session_id, file_path]
    );
    res.status(201).json({ message: 'Syllabus uploaded.', syllabus: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/syllabus/:id
router.delete('/:id', authenticate, can('delete syllabus'), async (req, res) => {
  try {
    await db.query('DELETE FROM syllabi WHERE id = $1', [req.params.id]);
    res.json({ message: 'Syllabus deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
