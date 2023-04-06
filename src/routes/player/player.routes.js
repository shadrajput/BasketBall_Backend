const express = require("express");
const {
  // isAuthenticatedUser,
  // isAuthPlayer
} = require("../../middlewares/auth");
const {
  playerRegistration,
  allPlayers,
  updatePlayerDetails,
  onePlayerDetailsbyId,
  onePlayerDetailsbyNumber,
  deletePlayerDetails,
} = require("./player.controller");
const router = express.Router();

router.post(
  "/registration",
  // isAuthenticatedUser,
  playerRegistration
);
router.get(
  "/list/:page&:PlayerName",
  // isAuthenticatedUser,
  allPlayers
);

router.get(
  "/details/:player_id",
  // isAuthenticatedUser,
  onePlayerDetailsbyId
);

router.get(
  "/search/:number",
  // isAuthenticatedUser,
  onePlayerDetailsbyNumber
);

router.put(
  "/update/:player_id",
  // isAuthenticatedUser,
  // isAuthPlayer,
  updatePlayerDetails
);

router.delete(
  "/delete/:player_id",
  // isAuthenticatedUser,
  // isAuthPlayer,
  deletePlayerDetails
);

module.exports = router;
