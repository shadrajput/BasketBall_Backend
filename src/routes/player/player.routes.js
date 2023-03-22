const express = require("express");
const {
  playerRegistration,
  allPlayers,
  updatePlayerDetails,
  onePlayerDetails,
  deletePlayerDetails,
} = require("./player.controller");
const { isAuthenticatedUser } = require("../../middlewares/auth");
const router = express.Router();

router.post("/registration", isAuthenticatedUser, playerRegistration);
router.get("/", isAuthenticatedUser, allPlayers);
router.get("/:player_id", isAuthenticatedUser, onePlayerDetails);
router.put("/update/:player_id", isAuthenticatedUser, updatePlayerDetails);
router.delete("/delete/:player_id", isAuthenticatedUser, deletePlayerDetails);

module.exports = router;
