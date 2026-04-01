const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/promotions/previous-session-data
router.get('/previous-session-data', authenticate, async (req, res) => {
  try {
    const { current_session_id } = req.query;
    
    // Get previous session
    const prevSessionRes = await db.query(
      'SELECT id FROM school_sessions WHERE id < $1 ORDER BY id DESC LIMIT 1',
      [current_session_id]
    );

    if (prevSessionRes.rows.length === 0) {
      return res.status(400).json({ message: 'No previous session found.' });
    }

    const prevSessionId = prevSessionRes.rows[0].id;

    // Get classes in previous session
    const classesRes = await db.query(
      'SELECT DISTINCT sc.* FROM school_classes sc JOIN student_academic_infos sai ON sai.class_id = sc.id WHERE sai.session_id = $1',
      [prevSessionId]
    );

    res.json({
      previousSessionId: prevSessionId,
      classes: classesRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/promotions
router.post('/', authenticate, can('promote students'), async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { students, target_session_id, target_class_id, target_section_id } = req.body;
    // students: [{student_id, student_id_card_number, target_class_id, target_section_id}, ...]

    for (const student of students) {
      // Upsert into student_academic_infos for the new session
      await client.query(
        `INSERT INTO student_academic_infos (student_id, session_id, class_id, section_id, student_id_card_number)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, session_id) DO UPDATE SET 
            class_id = $3, 
            section_id = $4, 
            student_id_card_number = $5,
            updated_at = NOW()`,
        [
          student.student_id, 
          target_session_id, 
          student.target_class_id || target_class_id, 
          student.target_section_id || target_section_id, 
          student.student_id_card_number
        ]
      );

      // Log promotion
      await client.query(
        'INSERT INTO promotions (student_id, session_id, class_id, section_id) VALUES ($1, $2, $3, $4)',
        [
          student.student_id, 
          target_session_id, 
          student.target_class_id || target_class_id, 
          student.target_section_id || target_section_id
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Students promoted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error.', error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
