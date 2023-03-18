const express = require('express');
const { matchScore } = require('./match.controller')

const router = express.Router();

router.get('/:match_id', matchScore)

module.exports = router