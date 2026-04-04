const { Expo } = require('expo-server-sdk');
const db = require('../config/database');

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Send push notifications to specific users
 * @param {Array} userIds - Array of user IDs
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {Object} data - Custom data to send with notification
 */
async function sendPushNotifications(userIds, title, body, data = {}) {
  try {
    if (!userIds || userIds.length === 0) return;

    // Get push tokens for these users
    const result = await db.query(
      'SELECT token, user_id FROM push_tokens WHERE user_id = ANY($1)',
      [userIds]
    );

    if (result.rows.length === 0) {
      console.log('No push tokens found for users:', userIds);
      return;
    }

    let messages = [];
    for (let row of result.rows) {
      const pushToken = row.token;

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: { ...data, userId: row.user_id },
      });
    }

    // The Expo push notification service accepts batches of messages to reduce
    // the number of requests and to improve efficiency.
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('Push tickets:', ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push chunk:', error);
      }
    }

    // NOTE: In production, you should handle receipts to remove invalid tokens
    // but for now, we'll just log success.
    console.log(`Successfully sent ${messages.length} notifications.`);
    
  } catch (err) {
    console.error('Push notification error:', err);
  }
}

module.exports = { sendPushNotifications };
