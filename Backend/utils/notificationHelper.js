const Notification = require('../models/Notification');

/**
 * Creates a notification in MongoDB.
 *
 * @param {string} type       - Notification type enum (e.g. 'marketplace', 'event')
 * @param {string} title      - Short title shown in the feed header
 * @param {string} message    - Descriptive body text
 * @param {string|number} recipientId  - Postgres users_id (as string) OR "all" for broadcast
 * @param {object} [metadata] - Optional extra data (postId, eventId, etc.)
 * @param {string|number} [excludeUserId] - Optional: Don't send notification to this user (e.g., the creator)
 */
const createNotification = async (type, title, message, recipientId, metadata = {}, excludeUserId = null) => {
    try {
        // Don't send notification if recipient is the same as the excluded user
        if (excludeUserId && String(recipientId) === String(excludeUserId)) {
            console.log(`[Notification] Skipping notification to user ${recipientId} (creator of action)`);
            return;
        }

        await Notification.create({
            type,
            title,
            message,
            recipientId: String(recipientId),
            metadata,
            excludeUserId: excludeUserId ? String(excludeUserId) : null
        });
    } catch (error) {
        // Log but do not throw – notifications are non-critical; main request must not fail
        console.error('[Notification] Failed to create notification:', error.message);
    }
};

/**
 * Creates notifications for multiple recipients (bulk personal notifications).
 *
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {Array<string|number>} recipientIds
 * @param {object} [metadata]
 * @param {string|number} [excludeUserId] - Optional: Don't send notification to this user (e.g., the creator)
 */
const createNotificationForMany = async (type, title, message, recipientIds, metadata = {}, excludeUserId = null) => {
    if (!recipientIds || recipientIds.length === 0) return;
    try {
        // Filter out the excluded user if specified
        const filteredRecipients = excludeUserId 
            ? recipientIds.filter(id => String(id) !== String(excludeUserId))
            : recipientIds;

        if (filteredRecipients.length === 0) {
            console.log('[Notification] No recipients after filtering excluded user');
            return;
        }

        const docs = filteredRecipients.map(id => ({
            type,
            title,
            message,
            recipientId: String(id),
            metadata,
            isRead: false,
            excludeUserId: excludeUserId ? String(excludeUserId) : null
        }));
        await Notification.insertMany(docs, { ordered: false });
    } catch (error) {
        console.error('[Notification] Failed to create bulk notifications:', error.message);
    }
};

module.exports = { createNotification, createNotificationForMany };
