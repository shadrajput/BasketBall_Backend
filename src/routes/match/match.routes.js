const express = require('express');
const { matchScore,matchList,updateMatchDetails } = require('./match.controller')
const { isAuthenticatedUser } = require("../../middlewares/auth");

const router = express.Router();

router.get('/score/:match_id', isAuthenticatedUser, matchScore)
router.get('/matches', 
// isAuthenticatedUser, 
matchList)
router.put('/update/:match_id', isAuthenticatedUser, updateMatchDetails)


module.exports = router