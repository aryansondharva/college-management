const db = require('./src/config/database');

(async () => {
    try {
        const constraints = await db.query(`
            SELECT conname as c_name, pg_get_constraintdef(c.oid) as c_def
            FROM pg_constraint c
            WHERE conrelid = 'marks'::regclass AND contype = 'u'
        `);
        console.log('UNIQUE CONSTRAINTS:');
        constraints.rows.forEach(r => console.log(' ->', r.c_name, '===', r.c_def));
        process.exit(0);
    } catch(err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
})();
