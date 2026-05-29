const asyncHandler = require("../utils/asyncHandler");
const Book = require("../models/bookModel");
const Review = require("../models/reviewModel");
const Thread = require("../models/threadModel");
const Message = require("../models/messageModel");

const isAdmin = (user) => user && user.role === "admin";

exports.ensureBookOwnerOrAdmin = asyncHandler(async (req, res, next) => {
  // Route param is :id for book routes.
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

  // review.user may already be populated or may still be an ObjectId.
  const reviewUserId =
    review.user && review.user._id ? review.user._id : review.user;
  if (String(reviewUserId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the author can modify this review");
  }

  next();
});

exports.ensureThreadOwnerOrAdmin = async (req, res, next) => {
  const thread = await Thread.findById(req.params.id);

  if (!thread) {
    res.status(404);
    throw new Error("Thread not found");
  }

  const isOwner = thread.createdBy.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  next();
};

exports.ensureMessageOwnerOrAdmin = async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  const isOwner = message.createdBy.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  next();
};
