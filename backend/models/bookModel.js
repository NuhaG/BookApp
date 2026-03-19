const mongoose = require("mongoose");

// Embedded chapter schema keeps chapter content versioned with its parent book.
const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      minlength: [2, "Chapter title must be at least 2 characters"],
      maxlength: [100, "Chapter title must be at most 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Chapter content is required"],
      trim: true,
      minlength: [10, "Chapter content must be at least 10 characters"],
      maxlength: [50000, "Chapter content must be at most 50000 characters"],
    },
    chapterNumber: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: [1, "Chapter number must be at least 1"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required!"],
      trim: true,
      minlength: [2, "Title must be atleast 2 characters long"],
      maxlength: [50, "Title can have a max length of 50 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [2, "Author name must be atleast 2 characters long"],
      maxlength: [50, "Author name cannot exeed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description can be of max len 1000"],
    },
    genre: [
      {
        type: String,
        trim: true,
        enum: [
          "fiction",
          "non-fiction",
          "fantasy",
          "science-fiction",
          "mystery",
          "thriller",
          "romance",
          "historical-fiction",
          "horror",
          "adventure",
          "young-adult",
          "children",
          "biography",
          "autobiography",
          "memoir",
          "history",
          "philosophy",
          "psychology",
          "self-help",
          "business",
          "technology",
          "science",
          "poetry",
          "drama",
          "comics",
          "graphic-novel",
          "other",
        ],
      },
    ],
    publishedYear: {
      type: Number,
      required: [true, "Published year is required"],
      min: [1000, "Invalid year"],
      max: [new Date().getFullYear(), "Year cannot be in future"],
    },
    coverImg: {
      type: String,
      default: "default-book.jpg",
    },
    // Reference to the user who created this book.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Cached aggregate values updated from review model hooks.
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    // Cached number of ratings for quick listing queries.
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    chapters: [chapterSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Book", bookSchema);
