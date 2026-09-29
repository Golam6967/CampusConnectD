const mongoose = require('mongoose');

/**
 * Tracks which users have read which notifications.
 * This gives each user their own independent read state,
 * even for broadcast ("all") notifications.
 */
const notificationReadSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        notificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Unique per user+notification pair — prevents duplicate receipts
notificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

module.exports = mongoose.model('NotificationRead', notificationReadSchema);
