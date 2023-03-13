const express = require('express');
const {isAuthenticatedUser} = require('../../middlewares/auth')
const { tournamentRegistration, updateTournamentDetails, tournamentDetails } = require('./tournament.controller')
const router = express.Router()

router.post('/registration', tournamentRegistration)
router.put('/update/:tournament_id', updateTournamentDetails)
router.get('/details/:tournament_id', tournamentDetails)

module.exports = router