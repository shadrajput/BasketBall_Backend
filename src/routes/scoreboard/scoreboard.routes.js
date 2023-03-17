const express = require('express');
const { startMatch, addScore } = require('./scoreboard.controller')

const router = express.Router();

router.put('/start-match/:match_id', startMatch)
router.put('/add-score/:match_id', addScore)

module.exports = router 