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
    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: [true, "Review must belong to a book."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
    // hides without deleting
    inappropriate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// indexing - 1 review per user for 1 book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// query middleware - runs for all .find.. methods
reviewSchema.pre(/^find/, function (next) {
  // filters inapp rev and never renders them on client side
  this.find({ inappropriate: { $ne: true } });

  // performance tracking
  this.start = Date.now();
  next();
});

// aggregation middleware
reviewSchema.pre("aggregate", function (next) {
  // unshift() adds a $match stage to the begin of agg pipeline, ensures exclusion of inapp rev
  this.pipeline().unshift({ $match: { inappropriate: { $ne: true } } });
  next();
});

// static methods - use static as we need to call it on a model
reviewSchema.statics.calcAverageRatings = async function (bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId } }, // look for avgRev for this book
    {
      $group: {
        _id: "$book",
        nRating: { $sum: 1 }, // no of rat
        avgRating: { $avg: "$rating" }, // avg rat
      },
    },
  ]);

  // persist
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // if the last review is deleted, reset the book to defaults
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// document middleware
// after saving - recalc for new reviews
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.book);
});

// after update.delete - recalcul for edited reviews
// update and del both use findOneAnd methods under the hood
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.book);
});

module.exports = mongoose.model("Review", reviewSchema);
