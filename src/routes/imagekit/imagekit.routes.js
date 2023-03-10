const express = require("express");
const {imagekitAuth} = require("./imagekit.controller")
const router = express.Router();

router.get("/auth", imagekitAuth);

module.exports = router