const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "message content is required"],
      trim: true,
    },
    thread: {
      type: mongoose.Schema.ObjectId,
      ref: "Thread",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // replies
    parentMessage: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
      default: null,
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

module.exports = mongoose.model("Message", messageSchema);
