const express = require('express');
const {isAuthenticatedUser} = require('../../middlewares/auth')
const { tournamentRegistration, updateTournamentDetails } = require('./tournament.controller')
const router = express.Router()

router.post('/registration', tournamentRegistration)
router.put('/update/:tournament_id', updateTournamentDetails)

module.exports = router