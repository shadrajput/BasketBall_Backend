const express = require('express');
const { playerRegistration,allPlayers, updatePlayerDetails, deletePlayerDetails } = require('./player.controller')
const router = express.Router()

router.post('/registration', playerRegistration)
router.get('/', allPlayers)
router.put('/update/:player_id', updatePlayerDetails)
router.delete('/delete/:player_id', deletePlayerDetails)

module.exports = router