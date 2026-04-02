const db = require('./src/config/database');
(async () => {
    try {
        const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        res.rows.forEach(r => console.log(r.table_name));
        process.exit(0);
    } catch(err) {
        console.error(err.message);
        process.exit(1);
    }
})();
