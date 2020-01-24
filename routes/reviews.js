const express = require("express");
const middleware = require("../middleware");
const {
  getReviews,
  getNewReviewPage,
  postReview,
  getReviewEditPage,
  editReview,
  deleteReview
} = require("../controllers/reviews");

const router = express.Router({ mergeParams: true });

router.get("/", getReviews);
router.get(
  "/new",
  middleware.isLoggedIn,
  middleware.checkReviewExistence,
  getNewReviewPage
);
router.post(
  "/",
  middleware.isLoggedIn,
  middleware.checkReviewExistence,
  postReview
);
router.get(
  "/:review_id/edit",
  middleware.checkReviewOwnership,
  getReviewEditPage
);
router.put("/:review_id", middleware.checkReviewOwnership, editReview);
router.delete("/:review_id", middleware.checkReviewOwnership, deleteReview);

module.exports = router;
