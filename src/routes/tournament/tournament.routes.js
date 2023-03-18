const express = require('express');
const {isAuthenticatedUser} = require('../../middlewares/auth')
const { tournamentRegistration, allTournaments, updateTournamentDetails, tournamentDetails, startRegistration, closeRegistration, startTournament, endTournament, disqualifyTeam, uploadGalleryImage } = require('./tournament.controller')
const router = express.Router()

router.post('/registration', tournamentRegistration)
router.get('/', allTournaments)
router.put('/update/:tournament_id', updateTournamentDetails)
router.get('/details/:tournament_id', tournamentDetails)
router.put('/start-registration/:tournament_id', startRegistration)
router.put('/close-registration/:tournament_id', closeRegistration)
router.put('/start/:tournament_id', startTournament)
router.put('/end/:tournament_id', endTournament)
router.put('/disqualify-team/:tournament_id/:team_id', disqualifyTeam)
router.post('/gallery/upload', uploadGalleryImage)

module.exports = router