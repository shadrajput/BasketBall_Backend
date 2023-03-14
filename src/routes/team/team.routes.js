const express = require("express");
const { httpTeamRegister } = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);

module.exports = teamRouter;
