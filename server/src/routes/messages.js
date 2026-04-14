
const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/contacts
// Students see other students in their class
router.get('/contacts', authenticate, async (req, res) => {
    try {
        const studentInfo = await db.query('SELECT class_id FROM student_academic_infos WHERE student_id = $1', [req.user.id]);
        if (studentInfo.rows.length === 0) {
            return res.json({ contacts: [] });
        }

        const classId = studentInfo.rows[0].class_id;

        // Fetch students in the same class
        const result = await db.query(`
            SELECT u.id, u.first_name, u.last_name, u.photo, u.role
            FROM users u
            JOIN student_academic_infos sai ON sai.student_id = u.id
            WHERE sai.class_id = $1 AND u.id != $2
        `, [classId, req.user.id]);

        res.json({ contacts: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/messages/:otherUserId
router.get('/:otherUserId', authenticate, async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const result = await db.query(`
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) 
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
            LIMIT 100
        `, [req.user.id, otherUserId]);

        res.json({ messages: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
