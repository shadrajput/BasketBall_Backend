const express = require("express");
const {
  httpTeamRegister,
  httpGetAllTeams,
  httpSearchTeamByName,
  httpGetTeamDetailById,
  httpUpdateTeam,
} = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);
teamRouter.get("/list/:page&:TeamName", httpGetAllTeams);
teamRouter.post("/search", httpSearchTeamByName);
teamRouter.put("/update", httpUpdateTeam);
teamRouter.get("/detail/:id", httpGetTeamDetailById);
module.exports = teamRouter;
