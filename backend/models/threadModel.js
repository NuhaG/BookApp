const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "thread title is required"],
      trim: true,
      maxLength: 100,
    },
    content: {
      type: String,
      required: [true, "thread can't be empty"],
      trim: true,
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // moderation
    isLocked: {
      type: Boolean,
      default: false,
    },
    // soft moderation
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Thread", threadSchema);
