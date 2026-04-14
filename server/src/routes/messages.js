
const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/inbox
// Fetch only users who have an existing chat history with the current user
router.get('/inbox', authenticate, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM (
                SELECT DISTINCT ON (partner_id) 
                    u.id, u.first_name, u.last_name, u.photo, u.role,
                    m.content as last_message, m.created_at as last_message_time
                FROM (
                    SELECT 
                        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as partner_id,
                        content, created_at
                    FROM messages
                    WHERE sender_id = $1 OR receiver_id = $1
                    ORDER BY created_at DESC
                ) m
                JOIN users u ON u.id = m.partner_id
                ORDER BY partner_id, m.created_at DESC
            ) final_result
            ORDER BY last_message_time DESC
        `, [req.user.id]);

        res.json({ contacts: result.rows });
    } catch (err) {
        console.error('INBOX ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
});

// GET /api/messages/search-contacts?q=...
router.get('/search-contacts', authenticate, async (req, res) => {
    try {
        const { q } = req.query;
        const studentInfo = await db.query('SELECT class_id FROM student_academic_infos WHERE student_id = $1', [req.user.id]);
        if (studentInfo.rows.length === 0) return res.json({ contacts: [] });
        const classId = studentInfo.rows[0].class_id;

        const result = await db.query(`
            SELECT u.id, u.first_name, u.last_name, u.photo, u.role
            FROM users u
            JOIN student_academic_infos sai ON sai.student_id = u.id
            WHERE sai.class_id = $1 
              AND u.id != $2
              AND (u.first_name ILIKE $3 OR u.last_name ILIKE $3 OR u.enrollment_no ILIKE $3)
            LIMIT 20
        `, [classId, req.user.id, `%${q}%`]);

        res.json({ contacts: result.rows });
    } catch (err) {
        console.error('SEARCH ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
});

// GET /api/messages/contacts
// Students see other students in their class (Keep as fallback or full list if needed)
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
            SELECT m.*, u.first_name || ' ' || u.last_name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
               OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.created_at ASC
            LIMIT 100
        `, [req.user.id, otherUserId]);

        res.json({ messages: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
