const express = require("express");
const {
  matchScore,
  updateMatchDetails,
  deleteMatch,
  getMatchList,
} = require("./match.controller");
const {
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
} = require("../../middlewares/auth");

const router = express.Router();
router.get("/list/:status&:pageNo", getMatchList);
router.get("/:match_id", isAuthenticatedUser, matchScore);

router.get("/score/:match_id", isAuthenticatedUser, matchScore);
router.put("/update/:match_id", isAuthenticatedUser, updateMatchDetails);
router.delete(
  "/delete/:tournament_id/:match_id",
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
  deleteMatch
);

module.exports = router;
