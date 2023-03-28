const express = require("express");
const {
  httpTeamRegister,
  httpGetAllTeams,
  httpSearchTeamByName,
  httpGetTeamDetailById,
} = require("./team.controller");

const teamRouter = express.Router();

teamRouter.post("/registration", httpTeamRegister);
teamRouter.get("/list/:page&:TeamName", httpGetAllTeams);
teamRouter.post("/search", httpSearchTeamByName);
teamRouter.get("/detail/:id", httpGetTeamDetailById);
module.exports = teamRouter;
