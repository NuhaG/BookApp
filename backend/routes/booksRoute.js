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
} = require("../controllers/bookController");
const { protect } = require("../middleware/auth");
const { ensureBookOwnerOrAdmin } = require("../middleware/ownership");
const { uploadCover } = require("../middleware/upload");

// review for nested routes /books/:bid/reviews
const reviewRouter = require("./reviewRoute");
const reviewController = require("../controllers/reviewController");
router.use("/:bookId/reviews", reviewRouter);

// trending books based on review data
router.get("/trending", reviewController.getTrendingBooks);
router.get("/my", protect, getMyBooks);

router.post("/", protect, uploadCover, createBook);
router.get("/", getBooks);
router.post("/:id/chapters", protect, ensureBookOwnerOrAdmin, addChapter);
router.get("/:id", getBook);
router.patch("/:id", protect, ensureBookOwnerOrAdmin, uploadCover, updateBook);
router.delete("/:id", protect, ensureBookOwnerOrAdmin, deleteBook);

module.exports = router;
