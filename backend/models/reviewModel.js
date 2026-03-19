const mongoose = require("mongoose");
const Book = require("./bookModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty!"],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A review must have a rating!"],
    },
    // FK to book
    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: [true, "Review must belong to a book."],
    },
    // FK to review user
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
    // Soft-hide inappropriate content without deleting records.
    inappropriate: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Track timestamps and expose virtuals in API responses.
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Enforce one review per user per book.
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Query middleware runs for find/findOne/findMany-style operations.
reviewSchema.pre(/^find/, function (next) {
  // Exclude soft-hidden reviews from normal queries.
  this.find({ inappropriate: { $ne: true } });

  // Optional timing marker for diagnostics.
  this.start = Date.now();
  next();
});

// Aggregation middleware mirrors the same inappropriate-content filter.
reviewSchema.pre("aggregate", function (next) {
  // unshift() adds $match to the beginning of the pipeline.
  this.pipeline().unshift({ $match: { inappropriate: { $ne: true } } });
  next();
});

// Static helper to recompute and persist book rating caches.
reviewSchema.statics.calcAverageRatings = async function (bookId) {
  // Recalculate rating metrics for one book.
  const stats = await this.aggregate([
    // Only aggregate reviews for the given book.
    { $match: { book: bookId } },
    {
      $group: {
        _id: "$book",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // Persist aggregate values onto the parent book document.
  if (stats.length > 0) {
    // Save values when reviews exist.
    await Book.findByIdAndUpdate(bookId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // If last review is deleted, reset book metrics.
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// After saving a review, recalculate the owning book's rating cache.
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.book);
});

// After update/delete (findOneAnd...), recalculate from the mutated doc.
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.book);
});

module.exports = mongoose.model("Review", reviewSchema);
