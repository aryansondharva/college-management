const db = require('./src/config/database');

(async () => {
    try {
        const cols = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position");
        console.log('events columns:');
        cols.rows.forEach(r => console.log(r.column_name, '|', r.data_type));
        process.exit(0);
    } catch(err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
})();
