const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res.status(400).json({ message: 'Email/ID and password are required.' });
    }

    console.log('Login attempt for identity:', identity);
    
    const result = await db.query(
      `SELECT u.*, sai.class_id, sai.section_id, sai.session_id
       FROM users u
       LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
       WHERE LOWER(u.email) = LOWER($1) OR u.enrollment_no = $1`,
      [identity]
    );
    console.log('User found in database:', result.rows.length > 0);

    if (result.rows.length === 0) {
      console.log('Failed login attempt: Identity not found');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Failed login attempt: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Get user permissions
    const permResult = await db.query(
      `SELECT DISTINCT p.name FROM permissions p
       LEFT JOIN user_permissions up ON up.permission_id = p.id AND up.user_id = $1
       LEFT JOIN role_permissions rp ON rp.permission_id = p.id
       LEFT JOIN user_roles ur ON ur.role_id = rp.role_id AND ur.user_id = $1
       WHERE up.user_id IS NOT NULL OR ur.user_id IS NOT NULL`,
      [user.id]
    );

    const permissions = permResult.rows.map(r => r.name);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, remember_token, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful.',
      token,
      user: { ...userWithoutPassword, permissions }
    });
  } catch (err) {
    console.error('🔥 LOGIN ERROR:', err);
    res.status(500).json({ 
      message: 'Server error.', 
      error: err.message,
      hint: err.message.includes('connect') ? 'Check DATABASE_URL connection string and SSL settings.' : 'Check database schema.'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.photo, u.gender, 
              u.phone, u.birthday, u.address, u.city, u.zip, u.blood_type, 
              u.enrollment_no, u.nationality, u.religion, p.father_name,
              sai.class_id, sai.section_id
       FROM users u
       LEFT JOIN student_parent_infos p ON p.student_id = u.id
       LEFT JOIN student_academic_infos sai ON sai.student_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];

    const permResult = await db.query(
      `SELECT DISTINCT p.name FROM permissions p
       LEFT JOIN user_permissions up ON up.permission_id = p.id AND up.user_id = $1
       LEFT JOIN role_permissions rp ON rp.permission_id = p.id
       LEFT JOIN user_roles ur ON ur.role_id = rp.role_id AND ur.user_id = $1
       WHERE up.user_id IS NOT NULL OR ur.user_id IS NOT NULL`,
      [user.id]
    );
    const permissions = permResult.rows.map(r => r.name);

    res.json({ user: { ...user, permissions } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password, new_password_confirmation } = req.body;

    if (new_password !== new_password_confirmation) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    const result = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/auth/profile
router.post('/profile', authenticate, async (req, res) => {
  try {
    const { 
      first_name, last_name, email, phone, gender, birthday, address, 
      city, zip, blood_type, father_name, nationality, religion 
    } = req.body;
    
    // Check if email already exists for another user
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already in use by another account.' });
    }

    // 1. Update main user table (excluding role and enrollment_no)
    await db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, gender = $5, 
           birthday = $6, address = $7, city = $8, zip = $9, blood_type = $10, 
           nationality = $11, religion = $12, updated_at = NOW() 
       WHERE id = $13`,
      [
        first_name, last_name, email, phone || '', gender || '', 
        birthday === '' ? null : birthday, address || '', 
        city || '', zip || '', blood_type || '', nationality || '', 
        religion || '', req.user.id
      ]
    );

    // 2. If student, update father_name in parent info
    const userResult = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows[0].role === 'student' && father_name) {
      const parentCheck = await db.query('SELECT 1 FROM student_parent_infos WHERE student_id = $1', [req.user.id]);
      if (parentCheck.rows.length > 0) {
        await db.query(
          'UPDATE student_parent_infos SET father_name = $1, updated_at = NOW() WHERE student_id = $2',
          [father_name, req.user.id]
        );
      } else {
        await db.query(
          'INSERT INTO student_parent_infos (student_id, father_name) VALUES ($1, $2)',
          [req.user.id, father_name]
        );
      }
    }

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/auth/logout (stateless JWT – just confirmation)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
