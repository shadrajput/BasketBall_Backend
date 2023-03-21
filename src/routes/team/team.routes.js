const express = require("express");
const { httpTeamRegister, httpGetAllTeams } = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);
teamRouter.get("/list/:page", httpGetAllTeams);
module.exports = teamRouter;
