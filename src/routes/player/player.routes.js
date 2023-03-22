const express = require('express');
const { isAuthenticatedUser } = require("../../middlewares/auth");
const { playerRegistration,allPlayers,updatePlayerDetails,onePlayerDetailsbyId,onePlayerDetailsbyNumber,deletePlayerDetails } = require('./player.controller')
const router = express.Router()

router.post('/registration', isAuthenticatedUser, playerRegistration)
router.get('/', isAuthenticatedUser, allPlayers)
router.get('/:player_id', isAuthenticatedUser, onePlayerDetailsbyId)
router.get('/:number', isAuthenticatedUser, onePlayerDetailsbyNumber)
router.put('/update/:player_id', isAuthenticatedUser, updatePlayerDetails)
router.delete('/delete/:player_id', isAuthenticatedUser, deletePlayerDetails)

module.exports = router;
