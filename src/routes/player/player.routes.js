const express = require('express');
const { playerRegistration, updatePlayerDetails } = require('./player.controller')
const router = express.Router()

router.post('/registration', playerRegistration)
router.put('/update/:player_id', updatePlayerDetails)

module.exports = router