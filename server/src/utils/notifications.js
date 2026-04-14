
const axios = require('axios');
const db = require('../config/database');

/**
 * Sends a push notification to specific user(s) using Expo Push API
 * @param {number|number[]} userIds - User ID or array of User IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data to send
 */
async function sendPushNotification(userIds, title, body, data = {}) {
    try {
        const targetIds = Array.isArray(userIds) ? userIds : [userIds];
        
        // Fetch tokens for these users
        const result = await db.query(
            'SELECT token FROM push_tokens WHERE user_id = ANY($1)',
            [targetIds]
        );

        const tokens = result.rows.map(r => r.token);
        if (tokens.length === 0) return;

        // Prepare Expo messages
        const allMessages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }));

        // Expo limits 100 messages per request - Chunking for safety
        const chunks = [];
        for (let i = 0; i < allMessages.length; i += 100) {
            chunks.push(allMessages.slice(i, i + 100));
        }

        console.log(`📡 Sending ${allMessages.length} notifications in ${chunks.length} batch(es)...`);

        for (const chunk of chunks) {
            try {
                await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                });
            } catch (chunkErr) {
                console.error('⚠️ Batch delivery issue (likely invalid tokens):', chunkErr.response?.data || chunkErr.message);
            }
        }

        console.log(`✅ All batches processed.`);
    } catch (err) {
        console.error('❌ Push notification error:', err.response?.data || err.message);
    }
}

module.exports = { sendPushNotification };
