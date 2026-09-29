const express = require('express');
const router = express.Router();
const societyController = require('../controllers/society.controller');

// Society routes
router.get('/societies', societyController.getAllSocieties);
router.get('/societies/:id', societyController.getSocietyById);
router.post('/societies', societyController.createSociety);
router.put('/societies/:id', societyController.updateSociety);

// Follow/Unfollow
router.post('/societies/:id/follow', societyController.toggleFollow);

// Admin management
router.post('/societies/:id/join-admin', societyController.joinAsAdmin);
router.post('/societies/:id/leave-admin', societyController.leaveAdmin);

// Panel members management
router.post('/societies/:id/panel-members', societyController.addPanelMember);
router.put('/societies/:id/panel-members/:memberId', societyController.updatePanelMember);
router.delete('/societies/:id/panel-members/:memberId', societyController.deletePanelMember);

// Past gallery management
router.post('/societies/:id/past-gallery', societyController.addPastEvent);
router.put('/societies/:id/past-gallery/:eventId', societyController.updatePastEvent);
router.delete('/societies/:id/past-gallery/:eventId', societyController.deletePastEvent);

module.exports = router;
