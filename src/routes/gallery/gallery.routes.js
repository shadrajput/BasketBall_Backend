const express = require("express");
const {
  addgallery,
  allGellery,
  oneGalleryDetails,
  updateGalleryDetails,
  deleteGalleryDetails,
} = require("./gallery.controller");
const { isAuthenticatedUser } = require("../../middlewares/auth");
const router = express.Router();

router.post("/add", isAuthenticatedUser, addgallery);
router.get("/", allGellery);
router.get("/:id", oneGalleryDetails);
router.put("/update/:id", isAuthenticatedUser, updateGalleryDetails);
router.delete("/delete/:id", isAuthenticatedUser, deleteGalleryDetails);

module.exports = router;
