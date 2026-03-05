const express = require("express");
const reviewController = require("../controllers/reviewController");

// merge params allow access of bookid from parent
const router = express.Router({ mergeParams: true }); 

// analytics for grouped stats
router.get('/review-stats', reviewController.getReviewStats); 

// create and display all
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

// delete and update one
router
  .route("/:id")
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
