// donorRoutes.js (or integrated into your main router)
const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller'); 
const { verifyToken } = require('../middleware/VerifyToken');

router.get('/getAllDonors',verifyToken,donorController.getAllDonors);


router.post('/register', verifyToken, donorController.registerDonor);
router.put('/toggleDonorStatus', verifyToken, donorController.toggleDonorStatus);
router.put('/update', verifyToken, donorController.updateDonorInfo);
module.exports = router;