const express = require('express');
const {isAuthenticatedUser} = require('../../middlewares/auth')
const {userSignup, userLogin} = require('./user.controller')
const router = express.Router()

router.post('/', userSignup)
router.post('/login', userLogin)

module.exports = router