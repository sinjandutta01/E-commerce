const pool = require("../db");

// 📌 Add a review
exports.addReview = async (req, res) => {
  try {
    const { product_id, user_id, rating, comment } = req.body;

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
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

    const result = await pool.query(
      `SELECT r.*, u.full_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id
       WHERE product_id = $1
       ORDER BY r.id DESC`,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// 📌 Update a review
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    const result = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2
       WHERE id = $3
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

    await pool.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
