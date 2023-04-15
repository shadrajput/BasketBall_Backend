const express = require('express');
const { isAuthenticatedUser } = require("../../middlewares/auth");
const {userSignup, userLogin, googleLogin, updateUserProfile, verifyAccount} = require('./user.controller')
const router = express.Router()

router.post('/', userSignup)
router.post('/login', userLogin)
router.get('/google-login', googleLogin)
router.put('/update-profile', isAuthenticatedUser, updateUserProfile)
router.get('/verify-account/:user_id/:token', verifyAccount)

module.exports = router