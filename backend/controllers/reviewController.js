const Review = require("../models/reviewModel");

exports.createReview = async (req, res) => {
  if (!req.body.book) req.body.book = req.params.bookId;

  // dummy
  req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({ success: true, data: newReview });
};

exports.getAllReviews = async (req, res) => {
  let filter = {};
  if (req.params.bookId) filter = { book: req.params.bookId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    success: true,
    results: reviews.length,
    data: { reviews },
  });
};

exports.deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
};

exports.updateReview = async (req, res) => {
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
};

exports.getReviewStats = async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: "$rating",
        numReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { stats },
  });
};

exports.getTrendingBooks = async (req, res) => {
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
};
