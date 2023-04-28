const express = require("express");
const {
  addgallery,
  allGallery,
  oneGalleryDetails,
  updateGalleryDetails,
  deleteGalleryDetails,
  adminGallery
} = require("./gallery.controller");
const { isAuthenticatedUser } = require("../../middlewares/auth");
const router = express.Router();

router.post("/add", 
// isAuthenticatedUser, 
addgallery);
router.get("/:category/:page", allGallery);
router.get("/:page", adminGallery)
router.get("/:id", oneGalleryDetails);
router.put("/update/:id", isAuthenticatedUser, updateGalleryDetails);
router.delete("/delete/:id", isAuthenticatedUser, deleteGalleryDetails);

module.exports = router;
