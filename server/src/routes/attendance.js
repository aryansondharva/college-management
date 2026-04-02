const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/attendance
// Params: session_id, class_id, section_id, date, course_id (optional)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }
    const { session_id, class_id, section_id, date, course_id } = req.query;
    
    let query = `
      SELECT a.*, u.first_name, u.last_name, u.photo
      FROM attendances a
      JOIN users u ON u.id = a.student_id
      WHERE a.session_id = $1 AND a.class_id = $2 AND a.section_id = $3 AND a.attendance_date = $4
    `;
    const params = [session_id, class_id, section_id, date];
    
    if (course_id && course_id !== '0') {
      params.push(course_id);
      query += ` AND a.course_id = $${params.length}`;
    }

    const result = await db.query(query, params);
    res.json({ attendances: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/attendance
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Forbidden: Only admins and teachers can take attendance.' });
    }
    const { session_id, class_id, section_id, date, course_id, attendance_data } = req.body;
    // attendance_data: [{student_id: 1, present: true}, ...]

    if (req.body.is_bulk_subjects) {
      // attendance_data: [{student_id: 1, subjects: {course_id_1: true, course_id_2: false, ...}}, ...]
      const queries = [];
      attendance_data.forEach(item => {
        Object.entries(item.subjects).forEach(([c_id, present]) => {
          queries.push(
            db.query(
              `INSERT INTO attendances (student_id, course_id, section_id, class_id, session_id, attendance_date, present)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (student_id, attendance_date, COALESCE(course_id, 0)) DO UPDATE SET present = $7, updated_at = NOW()`,
              [item.student_id, c_id === '0' ? null : c_id, section_id, class_id, session_id, date, present]
            )
          );
        });
      });
      await Promise.all(queries);
    } else {
      const queries = attendance_data.map(item => {
        return db.query(
          `INSERT INTO attendances (student_id, course_id, section_id, class_id, session_id, attendance_date, present)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (student_id, attendance_date, COALESCE(course_id, 0)) DO UPDATE SET present = $7, updated_at = NOW()`,
          [item.student_id, course_id || null, section_id, class_id, session_id, date, item.present]
        );
      });
      await Promise.all(queries);
    }
    const io = req.app.get('io');
    if (io) {
        // Broadcast to specific student IDs that were updated
        const studentIds = req.body.attendance_data.map(i => i.student_id);
        studentIds.forEach(sid => {
            console.log(`Broadcasting attendance update for student: ${sid}`);
            io.emit(`attendance-updated-${sid}`, { student_id: sid });
        });
        io.emit('attendance-dashboard-updated'); // General refresh for anyone listening
    }
    res.json({ message: 'Attendance recorded successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/attendance/student/:id
router.get('/student/:id', authenticate, async (req, res) => {
    try {
        const { session_id } = req.query;
        const result = await db.query(
            'SELECT * FROM attendances WHERE student_id = $1 AND session_id = $2 ORDER BY attendance_date DESC',
            [req.params.id, session_id]
        );
        res.json({ history: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/report
// Monthly summary for a class
router.get('/report', authenticate, can('view attendances'), async (req, res) => {
    try {
        const { session_id, class_id, section_id, month, year } = req.query;
        if (!session_id || !class_id || !month || !year) {
            return res.status(400).json({ message: 'Missing required filters.' });
        }

        const result = await db.query(`
            SELECT 
                a.student_id, 
                u.first_name, u.last_name, u.enrollment_no,
                a.course_id, 
                COUNT(*) FILTER (WHERE a.present = true) as attended,
                COUNT(*) as total
            FROM attendances a
            JOIN users u ON u.id = a.student_id
            WHERE a.session_id = $1 AND a.class_id = $2 AND a.section_id = $3
              AND EXTRACT(MONTH FROM a.attendance_date) = $4
              AND EXTRACT(YEAR FROM a.attendance_date) = $5
            GROUP BY a.student_id, u.first_name, u.last_name, u.enrollment_no, a.course_id
        `, [session_id, class_id, section_id, month, year]);

        // Transform data into: { student_id: { subjects: { course_id: { attended, total } }, info: { name, ... } } }
        const report = {};
        result.rows.forEach(row => {
            if (!report[row.student_id]) {
                report[row.student_id] = {
                    id: row.student_id,
                    name: `${row.first_name} ${row.last_name}`,
                    enrollment_no: row.enrollment_no,
                    subjects: {}
                };
            }
            report[row.student_id].subjects[row.course_id] = {
                attended: parseInt(row.attended),
                total: parseInt(row.total)
            };
        });

        res.json({ report: Object.values(report) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/daily-report
// Daily summary for a class
router.get('/daily-report', authenticate, can('view attendances'), async (req, res) => {
    try {
        const { session_id, class_id, section_id, month, year } = req.query;
        if (!session_id || !class_id || !month || !year) {
            return res.status(400).json({ message: 'Missing required filters.' });
        }

        let query = `
            SELECT 
                a.student_id, 
                u.first_name, u.last_name, u.enrollment_no,
                EXTRACT(DAY FROM a.attendance_date) as day,
                BOOL_OR(a.present) as is_present
            FROM attendances a
            JOIN users u ON u.id = a.student_id
            WHERE a.session_id = $1 AND a.class_id = $2
        `;
        const params = [session_id, class_id];

        if (section_id) {
            params.push(section_id);
            query += ` AND a.section_id = $${params.length}`;
        }

        params.push(month);
        query += ` AND EXTRACT(MONTH FROM a.attendance_date) = $${params.length}`;

        params.push(year);
        query += ` AND EXTRACT(YEAR FROM a.attendance_date) = $${params.length}`;

        query += ` GROUP BY a.student_id, u.first_name, u.last_name, u.enrollment_no, EXTRACT(DAY FROM a.attendance_date)`;

        const result = await db.query(query, params);

        const report = {};
        result.rows.forEach(row => {
            if (!report[row.student_id]) {
                report[row.student_id] = {
                    id: row.student_id,
                    name: `${row.first_name} ${row.last_name}`,
                    enrollment_no: row.enrollment_no,
                    days: {}
                };
            }
            report[row.student_id].days[parseInt(row.day)] = row.is_present;
        });

        res.json({ report: Object.values(report) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/subject-daily-report
router.get('/subject-daily-report', authenticate, can('view attendances'), async (req, res) => {
    try {
        const { session_id, class_id, section_id, month, year } = req.query;
        if (!session_id || !class_id || !month || !year) {
            return res.status(400).json({ message: 'Missing required filters.' });
        }

        let query = `
            SELECT 
                a.student_id, 
                u.first_name, u.last_name, u.enrollment_no,
                a.course_id,
                EXTRACT(DAY FROM a.attendance_date) as day,
                a.present
            FROM attendances a
            JOIN users u ON u.id = a.student_id
            WHERE a.session_id = $1 AND a.class_id = $2
        `;
        const params = [session_id, class_id];

        if (section_id) {
            params.push(section_id);
            query += ` AND a.section_id = $${params.length}`;
        }

        params.push(month);
        query += ` AND EXTRACT(MONTH FROM a.attendance_date) = $${params.length}`;

        params.push(year);
        query += ` AND EXTRACT(YEAR FROM a.attendance_date) = $${params.length}`;

        const result = await db.query(query, params);

        const report = {};
        result.rows.forEach(row => {
            if (!report[row.student_id]) {
                report[row.student_id] = {
                    id: row.student_id,
                    name: `${row.first_name} ${row.last_name}`,
                    enrollment_no: row.enrollment_no,
                    subjects: {}
                };
            }
            if (!report[row.student_id].subjects[row.course_id]) {
                report[row.student_id].subjects[row.course_id] = { days: {} };
            }
            report[row.student_id].subjects[row.course_id].days[parseInt(row.day)] = row.present;
        });

        res.json({ report: Object.values(report) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/today-summary
router.get('/today-summary', authenticate, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                sc.name as class_name,
                s.name as section_name,
                COUNT(a.id) FILTER (WHERE a.present = true) as present_count,
                COUNT(a.id) FILTER (WHERE a.present = false) as absent_count
            FROM school_classes sc
            JOIN sections s ON s.class_id = sc.id
            JOIN school_sessions ss ON ss.id = sc.session_id
            LEFT JOIN attendances a ON a.class_id = sc.id AND a.section_id = s.id AND a.attendance_date = CURRENT_DATE
            WHERE ss.current = true
              AND sc.name IN ('Sem-2', 'Sem-4', 'Sem-6', 'Sem-8')
            GROUP BY sc.id, sc.name, s.id, s.name, sc.numeric_name
            ORDER BY sc.numeric_name, s.name
        `);
        
        res.json({ summary: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/student-summary
router.get('/student-summary', authenticate, async (req, res) => {
    try {
        const student_id = req.user.id;
        const result = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE present = true) as attended,
                COUNT(*) as total
            FROM attendances
            WHERE student_id = $1 AND course_id IS NOT NULL
        `, [student_id]);
        
        const summary = result.rows[0];
        const percentage = summary.total > 0 ? Math.round((summary.attended / summary.total) * 100) : 0;

        res.json({ attended: summary.attended, total: summary.total, percentage });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
