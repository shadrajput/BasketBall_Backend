const express = require("express");
const { isAuthenticatedUser, isAuthenticatedAdmin} = require('../../middlewares/auth')
// const {} = require("./admin.controller");

const router = express.Router();

module.exports = router;
