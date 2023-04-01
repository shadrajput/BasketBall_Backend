const express = require("express");
const {
  startMatch,
  addScore,
  teamFoul,
  playerFoul,
  changeQuarter,
  undoScore,
  endMatch,
} = require("./scoreboard.controller");
const { verifyScorekeeper } = require("../../middlewares/auth");

const router = express.Router();

router.put("/start-match/:match_id", verifyScorekeeper, startMatch);
router.put("/add-score/:match_id", verifyScorekeeper, addScore);
router.put("/team-foul/:match_id", verifyScorekeeper, teamFoul);
router.put("/player-foul/:match_id", verifyScorekeeper, playerFoul);
router.put("/change-quarter/:match_id", verifyScorekeeper, changeQuarter);
router.put("/undo-score/:match_id", verifyScorekeeper, undoScore);
router.put("/end-match/:match_id", verifyScorekeeper, endMatch);

module.exports = router;
