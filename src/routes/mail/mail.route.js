const express = require("express");
const {
  httpScoreboardLinkMail
} = require("./mail.controller");

const router = express.Router();

router.post("/scoreboard-link", httpScoreboardLinkMail);

module.exports = router;
