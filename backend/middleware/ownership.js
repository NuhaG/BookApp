const asyncHandler = require("../utils/asyncHandler");
const Book = require("../models/bookModel");
const Review = require("../models/reviewModel");

const isAdmin = (user) => user && user.role === "admin";

exports.ensureBookOwnerOrAdmin = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  if (isAdmin(req.user)) return next();

  if (!book.createdBy) {
    res.status(403);
    throw new Error("Only the creator can modify this book");
  }

  if (String(book.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the creator can modify this book");
  }

  next();
});

exports.ensureReviewOwnerOrAdmin = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (isAdmin(req.user)) return next();

  const reviewUserId = review.user && review.user._id ? review.user._id : review.user;
  if (String(reviewUserId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the author can modify this review");
  }

  next();
});
