const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendController");
const authenticateToken = require("../middleware/auth");

router.get("/categories", authenticateToken, recommendationController.recommendCategories);
router.get("/products", authenticateToken, recommendationController.recommendProducts);
router.get("/products/popular", authenticateToken, recommendationController.recommendPopularProducts);

module.exports = router;