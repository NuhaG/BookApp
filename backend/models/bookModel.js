const mongoose = require("mongoose");

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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Book", bookSchema);
