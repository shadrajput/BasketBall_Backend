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

router.post("/add", isAuthenticatedUser, addnews);
router.get("/", allNews);
router.get("/:id", oneNewsDetails);
router.put("/update/:id", isAuthenticatedUser, updateNewsDetails);
router.delete("/delete/:id", isAuthenticatedUser, deleteNewsDetails);

module.exports = router;
