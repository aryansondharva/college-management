const db = require('./src/config/database');
(async () => {
  try {
    const res = await db.query("SELECT * FROM users LIMIT 1");
    const keys = Object.keys(res.rows[0] || {});
    console.log("Found columns:", keys.join(", "));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
