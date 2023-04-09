const express = require("express");
const {
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
} = require("../../middlewares/auth");
const {
  tournamentRegistration,
  allTournaments,
  tournamentOfOrganizer,
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
  isAuthenticOrganizer,
  createPools,
  matchFormation,
} = require("./tournament.controller");
const router = express.Router();

router.post("/registration", isAuthenticatedUser, tournamentRegistration);

router.get("/", 
isAuthenticatedUser, allTournaments);
 
router.get("/organizer", isAuthenticatedUser, tournamentOfOrganizer);

router.get("/details/:tournament_id", isAuthenticatedUser, tournamentDetails);
router.put(
  "/update/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  updateTournamentDetails
);
router.put(
  "/start-registration/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  startRegistration
);
router.put(
  "/close-registration/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  closeRegistration
);
router.put(
  "/start/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  startTournament
);
router.put(
  "/end/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  endTournament
);
router.get(
  "/teams-request/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  teamsRequests
);
router.put(
  "/teams-request/accept/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  acceptTeamRequest
);
router.put(
  "/teams-request/reject/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  rejectTeamRequest
);
router.put(
  "/disqualify-team/:tournament_id/:team_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  disqualifyTeam
);

router.get(
  "/auth-organizer/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  isAuthenticOrganizer,
);

router.put(
  "/create-groups/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  createPools
);
router.put(
  "/match-formation/:tournament_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  matchFormation
);


module.exports = router;
