const express = require("express");
const {
  matchScore,
  updateMatchDetails,
  updateMatchScorer,
  deleteMatch,
  matchList,
  getMatchList,
} = require("./match.controller");
const {
  isAuthenticatedUser,
  isAuthTournamentOrganizer,
} = require("../../middlewares/auth");

const router = express.Router();
router.get('/matches', 
isAuthenticatedUser, 
matchList)
router.get("/list/:status&:pageNo", getMatchList);
router.get("/:match_id", isAuthenticatedUser, matchScore);
router.get('/score/:match_id', isAuthenticatedUser, matchScore)
router.put('/update/:tournament_id/:match_id', isAuthenticatedUser, isAuthTournamentOrganizer, updateMatchDetails)
router.put('/add-update-scorekeeper/:tournament_id/:match_id', isAuthenticatedUser, isAuthTournamentOrganizer, updateMatchScorer)
router.delete('/delete/:tournament_id/:match_id', isAuthenticatedUser, isAuthTournamentOrganizer, deleteMatch)


module.exports = router
