const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { protect } = require("../middleware/auth");
const { ensureBookOwnerOrAdmin } = require("../middleware/ownership");

// review for nested routes /books/:bid/reviews
const reviewRouter = require("./reviewRoute");
const reviewController = require("../controllers/reviewController");
router.use("/:bookId/reviews", reviewRouter);

// trending books based on review data
router.get("/trending", reviewController.getTrendingBooks);

router.post("/", protect, createBook);
router.get("/", getBooks);
router.get("/:id", getBook);
router.patch("/:id", protect, ensureBookOwnerOrAdmin, updateBook);
router.delete("/:id", protect, ensureBookOwnerOrAdmin, deleteBook);

module.exports = router;
