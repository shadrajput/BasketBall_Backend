const express = require('express');
const { matchScore, updateMatchDetails } = require('./match.controller')
const { isAuthenticatedUser } = require("../../middlewares/auth");

const router = express.Router();

router.get('/score/:match_id', isAuthenticatedUser, matchScore)
router.put('/update/:match_id', isAuthenticatedUser, updateMatchDetails)

module.exports = router