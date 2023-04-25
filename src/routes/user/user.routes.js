const express = require('express');
const { isAuthenticatedUser } = require("../../middlewares/auth");
const {userSignup, userLogin, resendVerificationEmail, sendResetPasswordLink, resetUserPassword, getUserData, googleLogin, updateUserProfile, verifyAccount} = require('./user.controller')
const router = express.Router()

router.post('/', userSignup)
router.post('/login', userLogin)
router.get('/detail', getUserData)
router.post('/google-login', googleLogin)
router.put('/update-profile', isAuthenticatedUser, updateUserProfile)
router.get('/verify-account/:user_id/:token', verifyAccount)
router.get('/resend-verification-link', isAuthenticatedUser, resendVerificationEmail)
router.post('/send-reset-password-link', sendResetPasswordLink)
router.post('/reset-password', resetUserPassword)

module.exports = router