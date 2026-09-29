const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/VerifyToken');
const {
    getMyNotifications,
    markAsRead,
    markAllRead
} = require('../controllers/notification.controller');

// All routes are protected
router.get('/notifications', verifyToken, getMyNotifications);
router.patch('/notifications/read-all', verifyToken, markAllRead);
router.patch('/notifications/:id/read', verifyToken, markAsRead);

module.exports = router;
