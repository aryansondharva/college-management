const db = require('./src/config/database');
(async () => {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birthday'");
    console.log(res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
