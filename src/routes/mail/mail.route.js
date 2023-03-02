const express = require("express");
const {
  httpScoreboardLinkMail
} = require("./mail.controller");

const mailRouter = express.Router();

mailRouter.post("/scoreboard-link", httpScoreboardLinkMail);

module.exports = mailRouter;
