const db = require('./src/config/database');
(async () => {
  try {
    const res = await db.query("SELECT * FROM users LIMIT 1");
    console.log(Object.keys(res.rows[0] || {}).includes('updated_at'));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
