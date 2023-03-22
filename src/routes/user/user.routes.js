const express = require('express');
const {userSignup, userLogin, googleLogin, verifyAccount} = require('./user.controller')
const router = express.Router()

router.post('/', userSignup)
router.post('/login', userLogin)
router.get('/google-login', googleLogin)
router.get('/verify-account/:user_id/:token', verifyAccount)

module.exports = router