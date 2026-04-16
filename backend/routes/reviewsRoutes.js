const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");

// Add Review
router.post("/reviews/add", reviewsController.addReview);

// Get reviews for a product
router.get("/reviews/product/:productId", reviewsController.getReviewsByProduct);

// Update review
router.put("/reviews/:id", reviewsController.updateReview);

// Delete review
router.delete("/reviews/:id", reviewsController.deleteReview);

module.exports = router;
