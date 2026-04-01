const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// === GRADING SYSTEMS ===

// GET /api/grades/systems
router.get('/systems', authenticate, async (req, res) => {
  try {
    const { session_id } = req.query;
    const result = await db.query(
      `SELECT gs.*, s.name as semester_name, sc.name as class_name 
       FROM grading_systems gs
       LEFT JOIN semesters s ON s.id = gs.semester_id
       LEFT JOIN school_classes sc ON sc.id = gs.class_id
       WHERE gs.session_id = $1`,
      [session_id]
    );
    res.json({ gradingSystems: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/grades/systems
router.post('/systems', authenticate, can('create grading systems'), async (req, res) => {
  try {
    const { session_id, semester_id, class_id } = req.body;
    const result = await db.query(
      'INSERT INTO grading_systems (session_id, semester_id, class_id) VALUES ($1, $2, $3) RETURNING *',
      [session_id, semester_id, class_id]
    );
    res.status(201).json({ message: 'Grading system created.', gradingSystem: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// === GRADE RULES ===

// GET /api/grades/rules
router.get('/rules', authenticate, async (req, res) => {
  try {
    const { grading_system_id } = req.query;
    const result = await db.query('SELECT * FROM grade_rules WHERE grading_system_id = $1 ORDER BY min_mark DESC', [grading_system_id]);
    res.json({ gradeRules: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/grades/rules
router.post('/rules', authenticate, can('create grade rules'), async (req, res) => {
  try {
    const { grading_system_id, session_id, point, grade, min_mark, max_mark } = req.body;
    const result = await db.query(
      'INSERT INTO grade_rules (grading_system_id, session_id, point, grade, min_mark, max_mark) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [grading_system_id, session_id, point, grade, min_mark, max_mark]
    );
    res.status(201).json({ message: 'Grade rule created.', gradeRule: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/grades/rules/:id
router.delete('/rules/:id', authenticate, can('delete grade rules'), async (req, res) => {
  try {
    await db.query('DELETE FROM grade_rules WHERE id = $1', [req.params.id]);
    res.json({ message: 'Grade rule deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
