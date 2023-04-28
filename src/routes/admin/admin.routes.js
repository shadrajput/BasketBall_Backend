const express = require("express");
const {
  isAuthenticatedUser,
  isAuthenticatedAdmin,
} = require("../../middlewares/auth");
const {
  getTournamentRequest,
  approveTournamentRequest,
  getAdminDashboardData,
  cancelTournamentRequest,
  deleteTournament,
  deleteTeam,
  deletePlayer,
} = require("./admin.controller");

const router = express.Router();

router.get(
  '/dashboard-details',  
  isAuthenticatedUser,
  isAuthenticatedAdmin, 
  getAdminDashboardData
);

router.get(
  "/tournaments/requests",
  isAuthenticatedUser,
  isAuthenticatedAdmin,
  getTournamentRequest
);
router.put(
  "/tournament/approve/:tournament_id",
  isAuthenticatedUser,
  isAuthenticatedAdmin,
  approveTournamentRequest
);
router.put(
  "/tournament/cancel/:tournament_id",
  isAuthenticatedUser,
  isAuthenticatedAdmin,
  cancelTournamentRequest
);
router.delete(
  "/tournament/:tournament_id",
  isAuthenticatedUser,
  isAuthenticatedAdmin,
  deleteTournament
);
router.delete(
  "/team/:team_id",
  isAuthenticatedUser,
  isAuthenticatedAdmin,
  deleteTeam
);
router.delete(
  "/player/:player_id",
  isAuthenticatedUser,
  isAuthenticatedAdmin,
  deletePlayer
);

module.exports = router;
