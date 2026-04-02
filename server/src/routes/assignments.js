const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/assignments
router.get('/', authenticate, async (req, res) => {
  try {
    const { class_id, course_id } = req.query;
    let query = '';
    const params = [];

    if (req.user.role === 'student') {
        // Students see assignments for 'everyone' or where they are specifically listed
        query = `
            SELECT a.*, u.first_name as teacher_first, u.last_name as teacher_last, c.name as course_name
            FROM assignments a
            JOIN users u ON u.id = a.created_by
            JOIN courses c ON c.id = a.course_id
            WHERE a.class_id = (SELECT class_id FROM users WHERE id = $1)
            AND (a.target_audience = 'everyone' OR a.specific_student_ids @> $2::jsonb)
        `;
        params.push(req.user.id, JSON.stringify([req.user.id]));
    } else if (req.user.role === 'admin' || req.user.role === 'teacher') {
        // Admins see everything, Teachers see what they created or for their classes
        query = `
            SELECT a.*, u.first_name as teacher_first, u.last_name as teacher_last, c.name as course_name, cl.name as class_name
            FROM assignments a
            JOIN users u ON u.id = a.created_by
            JOIN courses c ON c.id = a.course_id
            JOIN school_classes cl ON cl.id = a.class_id
            WHERE 1=1
        `;
        if (class_id) {
            params.push(class_id);
            query += ` AND a.class_id = $${params.length}`;
        }
        if (course_id) {
            params.push(course_id);
            query += ` AND a.course_id = $${params.length}`;
        }
        if (req.user.role === 'teacher') {
            params.push(req.user.id);
            query += ` AND a.created_by = $${params.length}`;
        }
    }

    query += ' ORDER BY a.created_at DESC';
    const result = await db.query(query, params);
    res.json({ assignments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/assignments
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Forbidden: Only admins and teachers can allot work.' });
    }
    
    const { title, description, class_id, course_id, deadline, target_audience, specific_student_ids } = req.body;

    // Field Validation
    if (!title || !description || !class_id || !course_id || !deadline) {
        return res.status(400).json({ message: 'Missing required fields: title, description, class/subject, or deadline.' });
    }

    const result = await db.query(
      'INSERT INTO assignments (title, description, class_id, course_id, deadline, target_audience, specific_student_ids, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, parseInt(class_id), parseInt(course_id), deadline, target_audience || 'everyone', JSON.stringify(specific_student_ids || []), req.user.id]
    );
    res.status(201).json({ message: 'Assignment created successfully.', assignment: result.rows[0] });
  } catch (err) {
    console.error("Critical error in POST /api/assignments:", err);
    res.status(500).json({ 
        message: 'Internal server error while publishing.', 
        details: err.message,
        hint: 'Ensure all fields are valid and IDs are integers.'
    });
  }
});

module.exports = router;
