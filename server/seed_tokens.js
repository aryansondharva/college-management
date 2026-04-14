const db = require('./src/config/database');

async function seed() {
    try {
        console.log('📡 Starting batch token seeding for Class 21...');
        
        const query = `
            INSERT INTO push_tokens (user_id, token)
            SELECT student_id, 'ExponentPushToken[DUMMY_' || student_id || ']'
            FROM student_academic_infos
            WHERE class_id = 21
            ON CONFLICT (user_id, token) DO NOTHING;
        `;
        
        const res = await db.query(query);
        console.log(`✅ Success! Tokens seeded.`);
        
        const countRes = await db.query('SELECT COUNT(*) FROM push_tokens WHERE token LIKE \'ExponentPushToken[DUMMY_%\'');
        console.log(`📊 Current dummy tokens in DB: ${countRes.rows[0].count}`);
        
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        process.exit();
    }
}

seed();
