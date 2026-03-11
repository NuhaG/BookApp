const Review = require("../models/reviewModel");
const asyncHandler = require("../utils/asyncHandler");

// create a review for a book
exports.createReview = asyncHandler(async (req, res) => {
  // if book is not sent in body, read it from /books/:bookId/reviews route
  if (!req.body.book) req.body.book = req.params.bookId;

  // always set the review author from the authenticated user
  req.body.user = req.user._id;

  const newReview = await Review.create(req.body);
  res.status(201).json({ success: true, data: newReview });
});

// get all reviews or for one book
exports.getAllReviews = asyncHandler(async (req, res) => {
  // filter if book id present in params 
  let filter = {};
  if (req.params.bookId) filter = { book: req.params.bookId };

  // find all or find by book id
  const reviews = await Review.find(filter)
    .populate({ path: "user", select: "name email role" })
    .populate({ path: "book", select: "title author publishedYear" });

  res.status(200).json({
    success: true,
    results: reviews.length,
    data: { reviews },
  });
});

// delete a review 
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// update a review
exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// aggregate stats by rating
exports.getReviewStats = asyncHandler(async (req, res) => {
  // group reviews by rating, count rows, and compute avg ratig per grp
  const stats = await Review.aggregate([
    {
      $group: {
        _id: "$rating",
        numReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    // sort in descending order of rating
    {
      $sort: { _id: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

// trending books list from recent review activity
exports.getTrendingBooks = asyncHandler(async (req, res) => {
  // aggregate reviews from the last 30 days and rank books by review volume
  const trending = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: "$book",
        reviewCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
    { $sort: { reviewCount: -1 } },
    { $limit: 5 },
    // join with books to fectch book details 
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { trending },
  });
});
