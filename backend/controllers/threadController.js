const Thread = require("../models/threadModel");

const asyncHandler = require("../utils/asyncHandler");

// POST /books/:bookId/threads
exports.createThread = asyncHandler(async (req, res) => {
  req.body.book = req.params.bookId;
  req.body.createdBy = req.user._id;

  const thread = await Thread.create(req.body);

  res.status(201).json({
    success: true,
    data: thread,
  });
});

// GET /books/:bookId/threads
exports.getThreads = asyncHandler(async (req, res) => {
  const threads = await Thread.find({
    book: req.params.bookId,
    isDeleted: false,
  })
    .populate("createdBy", "name role")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    results: threads.length,
    data: threads,
  });
});

// GET /threads/:id
exports.getThread = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id).populate(
    "createdBy",
    "name role",
  );

  if (!thread || thread.isDeleted) {
    res.status(404);
    throw new Error("Thread not found");
  }

  res.status(200).json({
    success: true,
    data: thread,
  });
});

// PATCH /threads/:id
exports.updateThread = asyncHandler(async (req, res) => {
  const thread = await Thread.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!thread) {
    res.status(404);
    throw new Error("Thread not found");
  }

  res.status(200).json({
    success: true,
    data: thread,
  });
});

// DELETE /threads/:id
// soft delete only
exports.deleteThread = asyncHandler(async (req, res) => {
  const thread = await Thread.findByIdAndUpdate(
    req.params.id,
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  if (!thread) {
    res.status(404);
    throw new Error("Thread not found");
  }

  res.status(200).json({
    success: true,
    message: "Thread deleted successfully",
  });
});
