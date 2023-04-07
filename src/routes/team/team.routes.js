const express = require("express");
const {
  httpTeamRegister,
  httpGetAllTeams,
  httpGetTeamDetailById,
  httpUpdateTeam,
  httpGetTeamByUserId,
  httpPostTournament,
} = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);
teamRouter.get("/list/:page&:TeamName", httpGetAllTeams);
teamRouter.get("/user/:userId", httpGetTeamByUserId);
teamRouter.put("/update", httpUpdateTeam);
teamRouter.post("/tournament/register", httpPostTournament);
teamRouter.get("/detail/:id", httpGetTeamDetailById);
module.exports = teamRouter;
