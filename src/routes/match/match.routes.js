const express = require('express');
const { matchScore } = require('./match.controller')
const { isAuthenticatedUser } = require("../../middlewares/auth");

const router = express.Router();

router.get('/:match_id', isAuthenticatedUser, matchScore)

module.exports = router