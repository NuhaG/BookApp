const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  getMyBooks,
  getBook,
  updateBook,
  deleteBook,
  addChapter,
  updateChapter,
  fixChaptersPublishState,
} = require("../controllers/bookController");
const { protect, restrictTo } = require("../middleware/auth");
const { ensureBookOwnerOrAdmin } = require("../middleware/ownership");
const { uploadCover } = require("../middleware/upload");

// review for nested routes /books/:bid/reviews
const reviewRouter = require("./reviewRoute");
const reviewController = require("../controllers/reviewController");
router.use("/:bookId/reviews", reviewRouter);

// thread
const threadRouter = require("./threadRoute");
router.use("/:bookId/threads", threadRouter);

// Admin utility: fix all chapters with missing/falsy isPublished
router.post(
  "/admin/fix-chapters",
  protect,
  restrictTo("admin"),
  fixChaptersPublishState,
);

// trending books based on review data
router.get("/trending", reviewController.getTrendingBooks);
router.get("/my", protect, getMyBooks);

router.post("/", protect, uploadCover, createBook);
router.get("/", getBooks);
router.post("/:id/chapters", protect, ensureBookOwnerOrAdmin, addChapter);
router.patch(
  "/:id/chapters/:chapterId",
  protect,
  ensureBookOwnerOrAdmin,
  updateChapter,
);
router.get("/:id", getBook);
router.patch("/:id", protect, ensureBookOwnerOrAdmin, uploadCover, updateBook);
router.delete("/:id", protect, ensureBookOwnerOrAdmin, deleteBook);

module.exports = router;
