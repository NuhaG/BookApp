const express = require("express");
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");
const { ensureReviewOwnerOrAdmin } = require("../middleware/ownership");

// merge params allow access of bookid from parent
const router = express.Router({ mergeParams: true }); 

// analytics for grouped stats
router.get('/review-stats', reviewController.getReviewStats); 

// create and display all
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(protect, reviewController.createReview);

// delete and update one
router
  .route("/:id")
  .delete(protect, ensureReviewOwnerOrAdmin, reviewController.deleteReview)
  .patch(protect, ensureReviewOwnerOrAdmin, reviewController.updateReview);

module.exports = router;
