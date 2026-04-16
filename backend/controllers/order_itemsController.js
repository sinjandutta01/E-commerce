const pool = require("../db");

// 📌 Add item to order
exports.addOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity } = req.body;

    // 1️⃣ Ensure order exists
    const checkOrder = await pool.query(
      "SELECT id FROM orders WHERE id = $1",
      [order_id]
    );
    if (checkOrder.rowCount === 0) {
      return res.status(400).json({ error: "Order does not exist" });
    }

    // 2️⃣ Ensure product exists + get current price
    const product = await pool.query(
      "SELECT price FROM products WHERE id = $1",
      [product_id]
    );
    if (product.rowCount === 0) {
      return res.status(400).json({ error: "Product does not exist" });
    }

    const price_at_purchase = product.rows[0].price;

    // 3️⃣ If item exists → increment quantity instead of breaking UNIQUE(order_id, product_id)
    const existingItem = await pool.query(
      "SELECT id, quantity FROM order_items WHERE order_id = $1 AND product_id = $2",
      [order_id, product_id]
    );

    if (existingItem.rowCount > 0) {
      // Update quantity
      const newQty = existingItem.rows[0].quantity + quantity;

      const updated = await pool.query(
        `UPDATE order_items
         SET quantity = $1
         WHERE id = $2
         RETURNING *`,
        [newQty, existingItem.rows[0].id]
      );

      return res.json({ success: true, item: updated.rows[0] });
    }

    // 4️⃣ Insert new item
    const result = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, product_id, quantity, price_at_purchase]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error("Add Order Item Error:", error);
    res.status(500).json({ error: "Failed to add order item" });
  }
};


exports.getOrderItems = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const result = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get Order Items Error:", error);
    res.status(500).json({ error: "Failed to fetch order items" });
  }
};


// 📌 Update order item
exports.updateOrderItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    const result = await pool.query(
      `UPDATE order_items
       SET quantity = $1
       WHERE id = $2
       RETURNING *`,
      [quantity, itemId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update Order Item Error:", error);
    res.status(500).json({ error: "Failed to update order item" });
  }
};


// 📌 Delete an order item
exports.deleteOrderItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    await pool.query("DELETE FROM order_items WHERE id = $1", [itemId]);

    res.json({ success: true, message: "Order item removed" });
  } catch (error) {
    console.error("Delete Order Item Error:", error);
    res.status(500).json({ error: "Failed to delete order item" });
  }
};

