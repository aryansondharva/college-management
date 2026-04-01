const db = require('../config/database');

/**
 * Check if the authenticated user has a specific permission
 * @param {string} permissionName
 */
const can = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Check direct user permissions
      const directPerm = await db.query(
        `SELECT p.id FROM permissions p
         INNER JOIN user_permissions up ON up.permission_id = p.id
         WHERE up.user_id = $1 AND p.name = $2`,
        [userId, permissionName]
      );

      if (directPerm.rows.length > 0) {
        return next();
      }

      // Check role-based permissions
      const rolePerm = await db.query(
        `SELECT p.id FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         INNER JOIN user_roles ur ON ur.role_id = rp.role_id
         WHERE ur.user_id = $1 AND p.name = $2`,
        [userId, permissionName]
      );

      if (rolePerm.rows.length > 0) {
        return next();
      }

      return res.status(403).json({
        message: `Forbidden: You do not have the '${permissionName}' permission.`
      });
    } catch (err) {
      return res.status(500).json({ message: 'Permission check failed.', error: err.message });
    }
  };
};

/**
 * Check if user has ANY of the given permissions
 */
const canAny = (...permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await db.query(
        `SELECT p.name FROM permissions p
         LEFT JOIN user_permissions up ON up.permission_id = p.id AND up.user_id = $1
         LEFT JOIN role_permissions rp ON rp.permission_id = p.id
         LEFT JOIN user_roles ur ON ur.role_id = rp.role_id AND ur.user_id = $1
         WHERE p.name = ANY($2) AND (up.user_id IS NOT NULL OR ur.user_id IS NOT NULL)`,
        [userId, permissions]
      );

      if (result.rows.length > 0) {
        return next();
      }

      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    } catch (err) {
      return res.status(500).json({ message: 'Permission check failed.', error: err.message });
    }
  };
};

module.exports = { can, canAny };
