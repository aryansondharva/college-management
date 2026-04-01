const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

async function setup() {
  try {
    console.log("Checking for 'admin@ut.com'...");
    const check = await db.query('SELECT id FROM users WHERE email = $1', ['admin@ut.com']);
    
    if (check.rows.length > 0) {
      console.log("Admin exists, updating password to 'admin123'...");
      const hashed = await bcrypt.hash('admin123', 10);
      await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, 'admin@ut.com']);
      console.log("Password updated successfully.");
    } else {
      console.log("Admin not found. Creating brand new admin user...");
      const hashed = await bcrypt.hash('admin123', 10);
      const res = await db.query(
        `INSERT INTO users (first_name, last_name, email, gender, nationality, phone, address, role, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        ['Admin', 'User', 'admin@ut.com', 'Male', 'N/A', '00000000', 'Admin address', 'admin', hashed]
      );
      
      const adminId = res.rows[0].id;
      // Grant all permissions
      await db.query(
        'INSERT INTO user_permissions (user_id, permission_id) SELECT $1, id FROM permissions',
        [adminId]
      );
      console.log("Admin created successfully with all permissions.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Setup failed:", err);
    process.exit(1);
  }
}

setup();
