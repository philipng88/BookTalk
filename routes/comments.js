const express = require("express");
const middleware = require("../middleware");
const {
  getNewComment,
  postComment,
  getEditComment,
  editComment,
  deleteComment
} = require("../controllers/comments");

const router = express.Router({ mergeParams: true });

router.get("/new", middleware.isLoggedIn, getNewComment);
router.post("/", middleware.isLoggedIn, postComment);
router.get(
  "/:comment_id/edit",
  middleware.checkCommentOwnership,
  getEditComment
);
router.put("/:comment_id", middleware.checkCommentOwnership, editComment);
router.delete("/:comment_id", middleware.checkCommentOwnership, deleteComment);

module.exports = router;
