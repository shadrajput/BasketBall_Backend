const express = require("express");
const {
  addnews,
  allNews,
  oneNewsDetails,
  updateNewsDetails,
  deleteNewsDetails,
} = require("./news.controller");
const { isAuthenticatedUser } = require("../../middlewares/auth");
const router = express.Router();

router.post("/add",
  // isAuthenticatedUser, 
  addnews);
router.get("/:page", allNews);
router.get("/details/:id", oneNewsDetails);
router.put("/update",
  // isAuthenticatedUser,
  updateNewsDetails);
router.delete("/delete/:id",
  // isAuthenticatedUser,
  deleteNewsDetails);

module.exports = router;
