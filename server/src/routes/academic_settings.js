const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/academic-settings
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM academic_settings LIMIT 1');
    res.json({ academicSetting: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/academic-settings/attendance-type
router.post('/attendance-type', authenticate, can('update academic settings'), async (req, res) => {
  try {
    const { attendance_type } = req.body;
    const result = await db.query(
      `INSERT INTO academic_settings (attendance_type) VALUES ($1)
       ON CONFLICT (id) DO UPDATE SET attendance_type = $1 RETURNING *`,
      [attendance_type]
    );
    // Note: If no ID exists, might need to handle differently depending on schema. 
    // Usually academic_settings has a single row with id=1.
    res.json({ message: 'Attendance type updated.', academicSetting: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/academic-settings/final-marks-submission
router.post('/final-marks-submission', authenticate, can('update academic settings'), async (req, res) => {
  try {
    const { semester_id, class_id, status } = req.body;
    // status: 'open' or 'closed'
    const result = await db.query(
      `UPDATE academic_settings SET final_marks_submission_status = $1 WHERE id = 1 RETURNING *`,
      [status]
    );
    res.json({ message: 'Final marks submission status updated.', academicSetting: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
