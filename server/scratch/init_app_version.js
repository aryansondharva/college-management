const db = require('../src/config/database');

async function init() {
    try {
        await db.query('DELETE FROM app_versions');
        await db.query(`
            INSERT INTO app_versions (version_name, version_code, download_url, release_notes, is_latest) 
            VALUES ($1, $2, $3, $4, $5)
        `, ['1.0.2', 3, 'https://expo.dev/artifacts/eas/huJF2jD46RYPgJuJjBa2yg.apk', 'Production build from EAS', true]);

        
        console.log('App version initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Failed to initialize app version:', err);
        process.exit(1);
    }
}

init();
