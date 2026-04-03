const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/permissions');

const router = express.Router();

// GET /api/users/teachers
router.get('/teachers', authenticate, can('view users'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, gender, phone, photo, role, nationality, city, created_at, enrollment_no
       FROM users WHERE role = 'teacher' ORDER BY CASE WHEN enrollment_no IS NULL OR enrollment_no = '' THEN 1 ELSE 0 END, enrollment_no ASC, first_name ASC`
    );
    res.json({ teachers: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/users/employees
router.get('/employees', authenticate, can('view users'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, gender, phone, photo, role, nationality, city, created_at, enrollment_no
       FROM users WHERE role != 'student' ORDER BY role, CASE WHEN enrollment_no IS NULL OR enrollment_no = '' THEN 1 ELSE 0 END, enrollment_no ASC, first_name ASC`
    );
    res.json({ employees: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/users/teacher/:id
router.get('/teacher/:id', authenticate, async (req, res) => {
  try {
    const userRes = await db.query(
      'SELECT id, first_name, last_name, email, role, phone, gender, birthday, nationality, address FROM users WHERE id = $1 AND role = $2',
      [req.params.id, 'teacher']
    );
    
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Teacher not found' });
    
    const courseRes = await db.query(
      'SELECT c.*, sc.name as class_name FROM courses c JOIN school_classes sc ON sc.id = c.class_id WHERE c.teacher_id = $1',
      [req.params.id]
    );

    res.json({ teacher: userRes.rows[0], courses: courseRes.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/users/teachers
router.post('/teachers', authenticate, can('create users'), async (req, res) => {
  try {
    const { first_name, last_name, email, password, gender, nationality, phone, address, address2, city, zip, birthday, blood_type, religion, enrollment_no } = req.body;
    const hashed = await bcrypt.hash(password || 'teacher123', 10);

    const finalEnrollmentNo = enrollment_no === '' ? null : enrollment_no;
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, gender, nationality, phone, address, address2, city, zip, birthday, blood_type, religion, role, enrollment_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'teacher', $15) RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, hashed, gender, nationality||'', phone||'', address||'', address2||'', city||'', zip||'', birthday, blood_type||'', religion||'', finalEnrollmentNo]
    );
    res.status(201).json({ message: 'Teacher created successfully.', teacher: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Email or Enrollment No already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/users/teachers/:id
router.put('/teachers/:id', authenticate, can('edit users'), async (req, res) => {
  try {
    const { first_name, last_name, email, gender, nationality, phone, address, address2, city, zip, birthday, blood_type, religion, enrollment_no } = req.body;
    const finalEnrollmentNo = enrollment_no === '' ? null : enrollment_no;
    await db.query(
      `UPDATE users SET first_name=$1, last_name=$2, email=$3, gender=$4, nationality=$5, phone=$6, address=$7, address2=$8, city=$9, zip=$10, birthday=$11, blood_type=$12, religion=$13, enrollment_no=$14, updated_at=NOW()
       WHERE id=$15 AND role='teacher'`,
      [first_name, last_name, email, gender, nationality||'', phone||'', address||'', address2||'', city||'', zip||'', birthday === '' ? null : birthday, blood_type||'', religion||'', finalEnrollmentNo, req.params.id]
    );
    res.json({ message: 'Teacher updated successfully.' });
  } catch (err) {
    console.error('Error updating teacher:', err);
    if (err.code === '23505') return res.status(400).json({ message: 'Email or Enrollment No already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/users/employees
router.post('/employees', authenticate, can('create users'), async (req, res) => {
  try {
    const { first_name, last_name, email, password, gender, nationality, phone, address, role, enrollment_no } = req.body;
    const hashed = await bcrypt.hash(password || 'staff123', 10);
    const finalRole = role || 'staff';

    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, gender, nationality, phone, address, role, enrollment_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, hashed, gender, nationality||'', phone||'', address||'', finalRole, enrollment_no || null]
    );
    res.status(201).json({ message: 'Employee onboarding successful.', employee: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Email or Enrollment No already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, can('delete users'), async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/users/students
router.get('/students', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Forbidden.' });
    }
    const { session_id, class_id, section_id } = req.query;
    
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.gender, u.photo, u.role, u.enrollment_no,
             sai.class_id, sai.section_id, sai.session_id,
             sc.name as class_name, s.name as section_name
      FROM users u
      LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
      LEFT JOIN school_classes sc ON sc.id = sai.class_id
      LEFT JOIN sections s ON s.id = sai.section_id
      WHERE u.role = 'student'
    `;
    const params = [];
    if (session_id) { params.push(session_id); query += ` AND sai.session_id = $${params.length}`; }
    if (class_id && class_id !== '0') { params.push(class_id); query += ` AND sai.class_id = $${params.length}`; }
    if (section_id && section_id !== '0') { params.push(section_id); query += ` AND sai.section_id = $${params.length}`; }
    query += ' ORDER BY CASE WHEN u.enrollment_no IS NULL OR u.enrollment_no = \'\' THEN 1 ELSE 0 END, u.enrollment_no ASC, u.first_name ASC';

    const result = await db.query(query, params);
    res.json({ students: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/users/student/:id
router.get('/student/:id', authenticate, can('view users'), async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, first_name, last_name, email, gender, phone, photo, role, nationality, city, zip, birthday, blood_type, religion, address, enrollment_no FROM users WHERE id = $1 AND role = $2',
      [req.params.id, 'student']
    );
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Student not found.' });

    const parentResult = await db.query(
      'SELECT * FROM student_parent_infos WHERE student_id = $1', [req.params.id]
    );
    const academicResult = await db.query(
      `SELECT sai.*, sc.name as class_name, s.name as section_name, ss.session
       FROM student_academic_infos sai
       LEFT JOIN school_classes sc ON sc.id = sai.class_id
       LEFT JOIN sections s ON s.id = sai.section_id
       LEFT JOIN school_sessions ss ON ss.id = sai.session_id
       WHERE sai.student_id = $1`, [req.params.id]
    );

    res.json({
      student: userResult.rows[0],
      parent_info: parentResult.rows[0] || null,
      academic_info: academicResult.rows[0] || null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/users/students
router.post('/students', authenticate, can('create users'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, password, gender, nationality, phone, address, address2, city, zip, birthday, blood_type, religion, enrollment_no,
      father_name, mother_name, father_phone, mother_phone, guardian_name, guardian_phone,
      session_id, class_id, section_id
    } = req.body;

    const hashed = await bcrypt.hash(password || 'student123', 10);

    const finalEnrollmentNo = enrollment_no === '' ? null : enrollment_no;
    const userResult = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, gender, nationality, phone, address, address2, city, zip, birthday, blood_type, religion, role, enrollment_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'student', $15) RETURNING id`,
      [first_name, last_name, email, hashed, gender, nationality||'', phone||'', address||'', address2||'', city||'', zip||'', birthday, blood_type||'', religion||'', finalEnrollmentNo]
    );

    const studentId = userResult.rows[0].id;

    // Create parent info
    await db.query(
      `INSERT INTO student_parent_infos (student_id, father_name, mother_name, father_phone, mother_phone, guardian_name, guardian_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [studentId, father_name, mother_name, father_phone, mother_phone, guardian_name, guardian_phone]
    );

    // Create academic info
    if (session_id && class_id && section_id) {
      await db.query(
        'INSERT INTO student_academic_infos (student_id, session_id, class_id, section_id) VALUES ($1,$2,$3,$4)',
        [studentId, session_id, class_id, section_id]
      );
      // Also add promotion record
      await db.query(
        'INSERT INTO promotions (student_id, session_id, class_id, section_id) VALUES ($1,$2,$3,$4)',
        [studentId, session_id, class_id, section_id]
      );
    }

    res.status(201).json({ message: 'Student created successfully.', student_id: studentId });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Email or Enrollment No already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/users/students/:id
router.put('/students/:id', authenticate, can('edit users'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, gender, nationality, phone, address, address2, city, zip, birthday, blood_type, religion, enrollment_no,
      father_name, mother_name, father_phone, mother_phone, guardian_name, guardian_phone,
      session_id, class_id, section_id
    } = req.body;

    const finalEnrollmentNo = enrollment_no === '' ? null : enrollment_no;

    await db.query(
      `UPDATE users SET first_name=$1, last_name=$2, email=$3, gender=$4, nationality=$5, phone=$6, address=$7, address2=$8, city=$9, zip=$10, birthday=$11, blood_type=$12, religion=$13, enrollment_no=$14, updated_at=NOW()
       WHERE id=$15 AND role='student'`,
      [first_name, last_name, email, gender, nationality||'', phone||'', address||'', address2||'', city||'', zip||'', birthday === '' ? null : birthday, blood_type||'', religion||'', finalEnrollmentNo, req.params.id]
    );

    // Update or Insert Parent Info
    const parentCheck = await db.query('SELECT 1 FROM student_parent_infos WHERE student_id = $1', [req.params.id]);
    if (parentCheck.rows.length > 0) {
      await db.query(
        `UPDATE student_parent_infos SET father_name=$1, mother_name=$2, father_phone=$3, mother_phone=$4, guardian_name=$5, guardian_phone=$6, updated_at=NOW()
         WHERE student_id=$7`,
        [father_name||'', mother_name||'', father_phone||'', mother_phone||'', guardian_name||'', guardian_phone||'', req.params.id]
      );
    } else {
      await db.query(
        `INSERT INTO student_parent_infos (student_id, father_name, mother_name, father_phone, mother_phone, guardian_name, guardian_phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [req.params.id, father_name||'', mother_name||'', father_phone||'', mother_phone||'', guardian_name||'', guardian_phone||'']
      );
    }
    
    // Update or Insert Academic Info
    if (session_id && class_id && section_id) {
       const acadCheck = await db.query('SELECT 1 FROM student_academic_infos WHERE student_id = $1 AND session_id = $2', [req.params.id, session_id]);
       if (acadCheck.rows.length > 0) {
         await db.query(
           `UPDATE student_academic_infos SET class_id=$1, section_id=$2, updated_at=NOW()
            WHERE student_id=$3 AND session_id=$4`,
           [class_id, section_id, req.params.id, session_id]
         );
       } else {
         await db.query(
           'INSERT INTO student_academic_infos (student_id, session_id, class_id, section_id) VALUES ($1,$2,$3,$4)',
           [req.params.id, session_id, class_id, section_id]
         );
       }
    }

    res.json({ message: 'Student updated successfully.' });
  } catch (err) {
    console.error('Error updating student:', err);
    if (err.code === '23505') return res.status(400).json({ message: 'Email or Enrollment No already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/users/summary (for dashboard)
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { session_id } = req.query;

    const teacherCount = await db.query("SELECT COUNT(*) FROM users WHERE role = 'teacher'");
    const studentCountQ = session_id
      ? await db.query("SELECT COUNT(*) FROM promotions WHERE session_id = $1", [session_id])
      : await db.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const classCount = session_id
      ? await db.query("SELECT COUNT(*) FROM school_classes WHERE session_id = $1", [session_id])
      : await db.query("SELECT COUNT(*) FROM school_classes");
    const maleCount = session_id
      ? await db.query("SELECT COUNT(*) FROM promotions p INNER JOIN users u ON u.id = p.student_id WHERE p.session_id = $1 AND u.gender = 'Male'", [session_id])
      : await db.query("SELECT COUNT(*) FROM users WHERE role = 'student' AND gender = 'Male'");

    res.json({
      teacherCount: parseInt(teacherCount.rows[0].count),
      studentCount: parseInt(studentCountQ.rows[0].count),
      classCount: parseInt(classCount.rows[0].count),
      maleStudentCount: parseInt(maleCount.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
