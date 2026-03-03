const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

// nested review route
const reviewRouter = require("./reviewRoute");
const reviewController = require("../controllers/reviewController");
router.use("/:bookId/reviews", reviewRouter);

router.get("/trending", reviewController.getTrendingBooks);

// book routes
router.post("/", createBook);
router.get("/", getBooks);
router.get("/:id", getBook);
router.patch("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;
