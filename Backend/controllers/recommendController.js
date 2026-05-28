const pool = require("../db");

// 📌 Recommend Categories for a Customer
exports.recommendCategories = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT

    console.log("Fetching recommended categories for user:", userId);

    const result = await pool.query(
      `
      SELECT c.id, c.name, c.description, COUNT(oi.id) AS purchase_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.user_id = $1
      GROUP BY c.id, c.name, c.description
      ORDER BY purchase_count DESC
      LIMIT 5
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No purchase history found for this user." });
    }

    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error("Error recommending categories:", error);
    res.status(500).json({ error: "Failed to fetch recommended categories" });
  }
};

// 📌 Recommend Products
exports.recommendProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      WITH customer_categories AS (
        SELECT DISTINCT p.category_id
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
      )
      SELECT p.id, p.name, p.description, p.price, p.image_url
      FROM products p
      JOIN customer_categories cc ON p.category_id = cc.category_id
      WHERE p.id NOT IN (
        SELECT oi.product_id
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
      )
      LIMIT 10
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No recommended products available for this user." });
    }

    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error("Error recommending products:", error);
    res.status(500).json({ error: "Failed to fetch recommended products" });
  }
};

// 📌 Recommend Popular Products
exports.recommendPopularProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      WITH customer_categories AS (
        SELECT DISTINCT p.category_id
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
      )
      SELECT p.id, p.name, p.price, p.image_url, COUNT(oi.id) AS popularity
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      JOIN customer_categories cc ON p.category_id = cc.category_id
      WHERE p.id NOT IN (
        SELECT oi.product_id
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
      )
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY popularity DESC
      LIMIT 10
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No popular recommendations available for this user." });
    }

    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error("Error recommending popular products:", error);
    res.status(500).json({ error: "Failed to fetch popular recommendations" });
  }
};