const express = require("express");
const threadController = require("../controllers/threadController");
const { protect } = require("../middleware/auth");
const { ensureThreadOwnerOrAdmin } = require("../middleware/ownership");
// nested routes, /books/:bookId/threads
const router = express.Router({ mergeParams: true });

// message route
const messageRouter = require("./messageRoute");
router.use("/:threadId/messages", messageRouter);

router
  .route("/")
  .get(threadController.getThreads)
  .post(protect, threadController.createThread);

router
  .route("/:id")
  .get(threadController.getThread)
  .patch(protect, ensureThreadOwnerOrAdmin, threadController.updateThread)
  .delete(protect, ensureThreadOwnerOrAdmin, threadController.deleteThread);

module.exports = router;
