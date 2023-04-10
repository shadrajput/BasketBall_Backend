const express = require("express");
const { matchScore, updateMatchDetails, getMatchList } = require("./match.controller");
const { isAuthenticatedUser } = require("../../middlewares/auth");

const router = express.Router();
router.get("/list/:status&:pageNo", getMatchList);
router.get("/:match_id", isAuthenticatedUser, matchScore);

module.exports = router;
