const Review = require("../models/reviewModel");
const asyncHandler = require("../utils/asyncHandler");
const redisClient = require("../utils/redisClient");

// Create a review from either /reviews or /books/:bookId/reviews.
exports.createReview = asyncHandler(async (req, res) => {
  // If book is not sent in body, read it from /books/:bookId/reviews.
  if (!req.body.book) req.body.book = req.params.bookId;

  // always set the review author from the authenticated user
  req.body.user = req.user._id;

  const newReview = await Review.create(req.body);

  // invalidate trending cache
  await redisClient.del("books:trending");

  res.status(201).json({ success: true, data: newReview });
});

// Get all reviews, or only one book's reviews on nested route.
exports.getAllReviews = asyncHandler(async (req, res) => {
  // Apply nested filter if book id is present in params.
  let filter = {};
  if (req.params.bookId) filter = { book: req.params.bookId };

  // Populate basic user/book metadata for rendering.
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

  await redisClient.del("books:trending");

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

  await redisClient.del("books:trending");

  res.status(200).json({
    success: true,
    review,
  });
});

// Aggregate stats by rating bucket.
exports.getReviewStats = asyncHandler(async (req, res) => {
  // Group reviews by rating, count rows, and compute average per group.
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

// Build trending books from recent (last 30 days) review activity.
exports.getTrendingBooks = asyncHandler(async (req, res) => {
  const cacheKey = "books:trending";

  // 1. check cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  // 2. compute if no cache
  const trending = await Review.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
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
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
  ]);

  const response = {
    success: true,
    data: { trending },
  };

  // 3. cache for 5 min
  await redisClient.set(cacheKey, JSON.stringify(response), {
    ex: 300,
  });

  res.status(200).json(response);
});
