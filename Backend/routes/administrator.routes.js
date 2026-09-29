const express = require('express');
const router = express.Router();
const administratorController = require('../controllers/administrator.controller.js');
const societyController = require('../controllers/society.controller.js');
const { verifyToken } = require('../middleware/VerifyToken.js');

// Administrator login route
router.post('/login', administratorController.administratorGoogleSignin);

// Protected administrator routes
router.get(
    '/dashboard', 
    verifyToken, 
    administratorController.verifyAdministrator,
    administratorController.getAdministratorDashboard
);

// Society admin requests management
router.get(
    '/admin-requests',
    verifyToken,
    administratorController.verifyAdministrator,
    administratorController.getAllAdminRequests
);

router.post(
    '/admin-requests/approve',
    verifyToken,
    administratorController.verifyAdministrator,
    administratorController.approveAdminRequest
);

router.post(
    '/admin-requests/reject',
    verifyToken,
    administratorController.verifyAdministrator,
    administratorController.rejectAdminRequest
);

// Society management routes
router.get(
    '/societies',
    verifyToken,
    administratorController.verifyAdministrator,
    societyController.getAllSocieties
);

router.post(
    '/societies',
    verifyToken,
    administratorController.verifyAdministrator,
    societyController.createSociety
);

router.delete(
    '/societies/:id',
    verifyToken,
    administratorController.verifyAdministrator,
    societyController.deleteSociety
);

router.post(
    '/societies/:id/remove-admin',
    verifyToken,
    administratorController.verifyAdministrator,
    societyController.removeAdminFromSociety
);

module.exports = router;
