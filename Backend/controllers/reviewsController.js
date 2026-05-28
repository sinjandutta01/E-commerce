const pool = require("../db");

// 📌 Add a review
exports.addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id; // ✅ from JWT

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    // Check if already reviewed
    const existing = await pool.query(
      `SELECT 1 FROM reviews WHERE user_id=$1 AND product_id=$2`,
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "You already reviewed this product" });
    }

    // Optional: Purchase check
    const orderCheck = await pool.query(
      `SELECT 1 FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id=$1 AND oi.product_id=$2`,
      [user_id, product_id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ error: "Purchase required to review" });
    }

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [product_id, user_id, rating, comment]
    );

    res.json({ success: true, review: result.rows[0] });

  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
};

// 📌 Get reviews for a product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const reviews = await pool.query(
      `SELECT r.*, u.full_name 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id=$1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const stats = await pool.query(
      `SELECT 
         COUNT(*) as total_reviews,
         COALESCE(AVG(rating),0) as avg_rating
       FROM reviews
       WHERE product_id=$1`,
      [productId]
    );

    res.json({
      reviews: reviews.rows,
      summary: stats.rows[0],
    });

  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// 📌 Update a review
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // Check ownership
    const review = await pool.query(
      `SELECT user_id FROM reviews WHERE id=$1`,
      [reviewId]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE reviews
       SET rating=$1, comment=$2
       WHERE id=$3
       RETURNING *`,
      [rating, comment, reviewId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Update Review Error:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

// 📌 Delete review
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const user_id = req.user.id;

    const review = await pool.query(
      `SELECT user_id FROM reviews WHERE id=$1`,
      [reviewId]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await pool.query(`DELETE FROM reviews WHERE id=$1`, [reviewId]);

    res.json({ success: true, message: "Review deleted" });

  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
