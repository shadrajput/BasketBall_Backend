const express = require("express");
const { isAuthenticatedUser } = require("../../middlewares/auth");
const {
  tournamentRegistration,
  allTournaments,
  updateTournamentDetails,
  tournamentDetails,
  startRegistration,
  closeRegistration,
  startTournament,
  endTournament,
  teamsRequests,
  acceptTeamRequest,
  rejectTeamRequest,
  disqualifyTeam,
  createPools,
  matchFormation,
} = require("./tournament.controller");
const router = express.Router();

router.post("/registration", isAuthenticatedUser, tournamentRegistration);
router.get("/", isAuthenticatedUser, allTournaments);
router.put(
  "/update/:tournament_id",
  isAuthenticatedUser,
  updateTournamentDetails
);
router.get("/details/:tournament_id", isAuthenticatedUser, tournamentDetails);
router.put(
  "/start-registration/:tournament_id",
  isAuthenticatedUser,
  startRegistration
);
router.put(
  "/close-registration/:tournament_id",
  isAuthenticatedUser,
  closeRegistration
);
router.put("/start/:tournament_id", isAuthenticatedUser, startTournament);
router.put("/end/:tournament_id", isAuthenticatedUser, endTournament);
router.get("/teams-request/:tournament_id", isAuthenticatedUser, teamsRequests);
router.put(
  "/teams-request/accept/:tournament_id",
  isAuthenticatedUser,
  acceptTeamRequest
);
router.put(
  "/teams-request/reject/:tournament_id",
  isAuthenticatedUser,
  rejectTeamRequest
);
router.put(
  "/disqualify-team/:tournament_id/:team_id",
  isAuthenticatedUser,
  disqualifyTeam
);
router.put("/create-groups/:tournament_id", isAuthenticatedUser, createPools);
router.put(
  "/match-formation/:tournament_id",
  isAuthenticatedUser,
  matchFormation
);

module.exports = router;
