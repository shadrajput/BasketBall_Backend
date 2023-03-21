const express = require("express");
const {
  httpTeamRegister,
  httpGetAllTeams,
  httpSearchTeamByName,
} = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);
teamRouter.get("/list/:page", httpGetAllTeams);
teamRouter.post("/search", httpSearchTeamByName);
module.exports = teamRouter;
