
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
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }));

        // Send to Expo
        await axios.post('https://exp.host/--/api/v2/push/send', messages, {
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });

        console.log(`📡 Push notification sent to ${tokens.length} token(s)`);
    } catch (err) {
        console.error('❌ Push notification error:', err.response?.data || err.message);
    }
}

module.exports = { sendPushNotification };
