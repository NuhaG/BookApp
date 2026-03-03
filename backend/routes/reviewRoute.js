const express = require("express");
const reviewController = require("../controllers/reviewController");

// mergeParams allows us to access :bookId from the parent router
const router = express.Router({ mergeParams: true });

router.get('/review-stats', reviewController.getReviewStats);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router
  .route("/:id")
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
