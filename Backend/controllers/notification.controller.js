const Notification = require('../models/Notification');
const NotificationRead = require('../models/NotificationRead');

// GET /api/notifications
// Returns the last 50 notifications for the logged-in user (personal + broadcast)
// Each notification's isRead flag is computed PER USER via the NotificationRead collection.
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = String(req.verifiedUser.user_id);

        // 1. Fetch relevant notifications (personal + broadcast)
        const notifications = await Notification.find({
            $or: [
                { recipientId: userId },
                { recipientId: 'all' }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        if (notifications.length === 0) {
            return res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
        }

        // 2. Fetch this user's read receipts for those notification IDs
        const notifIds = notifications.map(n => n._id);
        const readReceipts = await NotificationRead.find({
            userId,
            notificationId: { $in: notifIds }
        }).lean();

        // 3. Build a Set of read notification IDs for O(1) lookup
        const readSet = new Set(readReceipts.map(r => r.notificationId.toString()));

        // 4. Compute per-user isRead for each notification
        const result = notifications.map(n => ({
            ...n,
            isRead: readSet.has(n._id.toString())
        }));

        const unreadCount = result.filter(n => !n.isRead).length;

        res.status(200).json({ success: true, notifications: result, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
};

// PATCH /api/notifications/:id/read
// Marks a single notification as read for this specific user
exports.markAsRead = async (req, res) => {
    try {
        const userId = String(req.verifiedUser.user_id);
        const { id } = req.params;

        // Verify the notification actually exists and targets this user
        const notification = await Notification.findOne({
            _id: id,
            $or: [{ recipientId: userId }, { recipientId: 'all' }]
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Upsert a read receipt — safe to call multiple times, won't duplicate
        await NotificationRead.updateOne(
            { userId, notificationId: id },
            { $set: { userId, notificationId: id } },
            { upsert: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Error updating notification' });
    }
};

// PATCH /api/notifications/read-all
// Marks all of this user's notifications as read
exports.markAllRead = async (req, res) => {
    try {
        const userId = String(req.verifiedUser.user_id);

        // Fetch all notifications relevant to this user
        const notifications = await Notification.find({
            $or: [{ recipientId: userId }, { recipientId: 'all' }]
        }).select('_id').lean();

        if (notifications.length === 0) {
            return res.status(200).json({ success: true, message: 'Nothing to mark' });
        }

        // Bulk upsert read receipts — one per notification, skipping already-read ones
        const ops = notifications.map(n => ({
            updateOne: {
                filter: { userId, notificationId: n._id },
                update: { $set: { userId, notificationId: n._id } },
                upsert: true
            }
        }));

        await NotificationRead.bulkWrite(ops, { ordered: false });

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Error updating notifications' });
    }
};
