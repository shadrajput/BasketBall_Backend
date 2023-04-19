const express = require("express");
const {
  httpScoreboardLinkMail
} = require("./mail.controller");
const {isAuthenticatedUser, isAuthTournamentOrganizer} = require('../../middlewares/auth')

const router = express.Router();

router.put("/scoreboard-link/:tournament_id", isAuthenticatedUser, isAuthTournamentOrganizer, httpScoreboardLinkMail);

module.exports = router;
