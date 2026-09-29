const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

// Event routes
router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEventById);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

// Registration routes
router.post('/events/:id/register', eventController.registerForEvent);
router.post('/events/:id/unregister', eventController.unregisterFromEvent);
router.delete('/events/:id/register', eventController.unregisterFromEvent);

module.exports = router;
