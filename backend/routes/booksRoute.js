const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

// review for nested routes /books/:bid/reviews
const reviewRouter = require("./reviewRoute");
const reviewController = require("../controllers/reviewController");
router.use("/:bookId/reviews", reviewRouter);

// trending books based on review data
router.get("/trending", reviewController.getTrendingBooks);

router.post("/", createBook);
router.get("/", getBooks);
router.get("/:id", getBook);
router.patch("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;
