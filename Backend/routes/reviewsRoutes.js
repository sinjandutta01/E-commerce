const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const authenticateToken = require("../middleware/auth"); // Your authentication middleware
// Add Review
router.post("/reviews/add",authenticateToken, reviewsController.addReview);

// Get reviews for a product
router.get("/reviews/product/:productId",reviewsController.getReviewsByProduct);

// Update review
router.put("/reviews/:id",authenticateToken, reviewsController.updateReview);

// Delete review
router.delete("/reviews/:id",authenticateToken, reviewsController.deleteReview);

module.exports = router;
