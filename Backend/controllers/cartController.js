const pool = require('../db');

// Create Cart
const createCart = async (req, res) => {
  const user_id = req.user.id;

  try {
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json(existing.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO cart (user_id) VALUES ($1) RETURNING *`,
      [user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Cart by User ID (NOT USED BY FRONTEND NOW)
const getCartByUser = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Cart Items
const getCartItemsByUser = async (req, res) => {
  const user_id = req.user.id;

  try {
    const cart = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1",
      [user_id]
    );

    if (cart.rows.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartId = cart.rows[0].id;

    const items = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1",
      [cartId]
    );

    res.json({
      cartId,
      itemCount: items.rows.length,
      items: items.rows
    });
  } catch (err) {
    console.error("Fetch cart items error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Cart
const deleteCart = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM cart WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({ message: "Cart deleted" });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCart,
  getCartByUser,
  getCartItemsByUser,
  deleteCart
};
