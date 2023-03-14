const express = require('express');
const { playerRegistration,allPlayers,updatePlayerDetails,onePlayerDetails,deletePlayerDetails } = require('./player.controller')
const router = express.Router()

router.post('/registration', playerRegistration)
router.get('/', allPlayers)
router.get('/:player_id', onePlayerDetails)
router.put('/update/:player_id', updatePlayerDetails)
router.delete('/delete/:player_id', deletePlayerDetails)

module.exports = router