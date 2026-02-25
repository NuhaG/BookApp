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
    publishedYear: {
      type: Number,
      required: [true, "Published year is required"],
      min: [1000, "Invalid year"],
      max: [new Date().getFullYear(), "Year cannot be in future"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Book", bookSchema);
