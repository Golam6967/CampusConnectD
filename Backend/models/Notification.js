const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                'marketplace',
                'pre_order',
                'event',
                'society',
                'lost_found',
                'roommate',
                'feedback',
                'blood'
            ]
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 400
        },
        // userId string (from Postgres users_id) OR "all" for broadcast
        recipientId: {
            type: String,
            required: true,
            index: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        // Optional extra data (postId, eventId, etc.)
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // Optional: User ID to exclude from receiving this notification (e.g., the creator)
        excludeUserId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient polling queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
