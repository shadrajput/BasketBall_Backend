const express = require('express');
const {isAuthenticatedUser} = require('../../middlewares/auth')
const { tournamentRegistration } = require('./tournament.controller')
const router = express.Router()

router.post('/registration', tournamentRegistration)

module.exports = router