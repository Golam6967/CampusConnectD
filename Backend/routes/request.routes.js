// requestRoutes.js
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller'); // Path to your new controller
const { verifyToken } = require('../middleware/VerifyToken');

router.post('/create', verifyToken, requestController.createBloodRequest);
router.delete('/cancel/:requestId', verifyToken, requestController.cancelBloodRequest);
router.get('/all', verifyToken, requestController.getAllRequests);

module.exports = router;