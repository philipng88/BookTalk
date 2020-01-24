const express = require("express");
const middleware = require("../middleware");
const {
  getUserProfilePage,
  getUserProfileEditPage,
  editUserProfile
} = require("../controllers/users");

const router = express.Router();

router.get("/:id", getUserProfilePage);
router.get(
  "/:id/edit",
  middleware.checkUserProfileOwnership,
  getUserProfileEditPage
);
// router.put("/:id", middleware.checkUserProfileOwnership, editUserProfile);

module.exports = router;
