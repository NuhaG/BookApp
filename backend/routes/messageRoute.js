const express = require("express");
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const { ensureMessageOwnerOrAdmin } = require("../middleware/ownership");
// nested route /threads/:threadId/messages
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(messageController.getMessages)
  .post(protect, messageController.createMessage);

router
  .route("/:id")
  .patch(protect, ensureMessageOwnerOrAdmin, messageController.updateMessage)
  .delete(protect, ensureMessageOwnerOrAdmin, messageController.deleteMessage);

module.exports = router;
