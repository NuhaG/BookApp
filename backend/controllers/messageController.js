const Message = require("../models/messageModel");

const Thread = require("../models/threadModel");

const asyncHandler = require("../utils/asyncHandler");

// POST /threads/:threadId/messages
exports.createMessage = asyncHandler(async (req, res) => {
  // validate thread exists
  const thread = await Thread.findById(req.params.threadId);

  if (!thread || thread.isDeleted) {
    res.status(404);
    throw new Error("Thread not found");
  }

  // prevent posting in locked thread
  if (thread.isLocked) {
    res.status(403);
    throw new Error("Thread is locked");
  }

  req.body.thread = req.params.threadId;
  req.body.createdBy = req.user._id;

  const message = await Message.create(req.body);

  res.status(201).json({
    success: true,
    data: message,
  });
});

// GET /threads/:threadId/messages
exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    thread: req.params.threadId,
    isDeleted: false,
  })
    .populate("createdBy", "name role")
    .sort("createdAt");

  res.status(200).json({
    success: true,
    results: messages.length,
    data: messages,
  });
});

// PATCH /messages/:id
exports.updateMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// DELETE /messages/:id
// soft delete
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});
