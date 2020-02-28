const express = require("express");
const middleware = require("../middleware");
const upload = require("../utils/multer");

const {
  getSearchResults,
  getNewBookPage,
  getBookRequestPage,
  getOneBook,
  getBookEditPage,
  postBook,
  editBook,
  deleteBook,
  toggleBookLike,
  getBookRequestsPage,
  postBookRequest,
  deleteBookRequest
} = require("../controllers/books");

const router = express.Router();

router.get("/", getSearchResults);
router.post(
  "/",
  middleware.isLoggedInAndAdmin,
  upload.single("image"),
  postBook
);
router.get("/new", middleware.isLoggedInAndAdmin, getNewBookPage);
router.get("/request", middleware.isLoggedInAndUser, getBookRequestPage);
router.post("/request", middleware.isLoggedInAndUser, postBookRequest);
router.delete("/:request_id", middleware.isLoggedInAndAdmin, deleteBookRequest);
router.get(
  "/book-requests",
  middleware.isLoggedInAndAdmin,
  getBookRequestsPage
);
router.get("/:slug", getOneBook);
router.get("/:slug/edit", middleware.isLoggedInAndAdmin, getBookEditPage);
router.put(
  "/:slug",
  middleware.isLoggedInAndAdmin,
  upload.single("image"),
  editBook
);
router.delete("/:slug", middleware.isLoggedInAndAdmin, deleteBook);
router.post("/:slug/like", middleware.isLoggedIn, toggleBookLike);

module.exports = router;
