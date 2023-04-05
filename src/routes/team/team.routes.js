const express = require("express");
const {
  httpTeamRegister,
  httpGetAllTeams,
  httpGetTeamDetailById,
  httpUpdateTeam,
  httpGetTeamByUserId,
} = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);
teamRouter.get("/list/:page&:TeamName", httpGetAllTeams);
teamRouter.get("/user/:userId", httpGetTeamByUserId);
teamRouter.put("/update", httpUpdateTeam);
teamRouter.get("/detail/:id", httpGetTeamDetailById);
module.exports = teamRouter;
