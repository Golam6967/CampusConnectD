const express = require('express')
const router= express.Router()
const authController = require('../controllers/auth.controller.js')
const authMiddleware = require('../middleware/auth.middleware.js')
const VerifyToken = require('../middleware/VerifyToken.js')




router.post('/verify-domain',authController.googleSignin);
router.get('/logout',authController.logout)




module.exports=router