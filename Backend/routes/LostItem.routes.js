const express = require('express');
const router = express.Router();
const lostItemController = require('../controllers/lostItem.controller');
const { verifyToken } = require('../middleware/VerifyToken');

console.log(lostItemController)
router.post('/create',verifyToken,lostItemController.createLostItem);
router.get('/all', lostItemController.getAllLostItems);
router.delete('/delete/:id', verifyToken, lostItemController.deleteLostItem);

module.exports = router;