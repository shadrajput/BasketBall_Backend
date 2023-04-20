const express = require("express");
const {
  mailScoreboardLink
} = require("./mail.controller");
const {isAuthenticatedUser, isAuthTournamentOrganizer} = require('../../middlewares/auth')

const router = express.Router();

router.put("/scoreboard-link/:tournament_id", isAuthenticatedUser, isAuthTournamentOrganizer, mailScoreboardLink);

module.exports = router;
