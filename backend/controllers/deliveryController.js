const pool = require("../db");


// 📌 Assign Delivery Agent to Order
exports.assignDelivery = async (req, res) => {
  try {
    const { order_id, delivery_agent_id } = req.body;

    if (!order_id || !delivery_agent_id) {
      return res.status(400).json({ error: "Order ID and Delivery Agent ID are required." });
    }

    // Check if already assigned
    const existing = await pool.query(
      "SELECT * FROM deliveries WHERE order_id = $1",
      [order_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Delivery already assigned for this order." });
    }

    const result = await pool.query(
      `INSERT INTO deliveries (order_id, delivery_agent_id, status)
       VALUES ($1, $2, 'assigned')
       RETURNING *`,
      [order_id, delivery_agent_id]
    );

    res.status(201).json({
      success: true,
      message: "Delivery agent assigned successfully",
      delivery: result.rows[0]
    });

  } catch (error) {
    console.error("Assign Delivery Error:", error);
    res.status(500).json({ error: "Failed to assign delivery" });
  }
};


// 📌 Update Delivery Status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "assigned",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "failed"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    let query = `
      UPDATE deliveries 
      SET status = $1
    `;

    // Add timestamps based on status
    if (status === "picked_up") {
      query += `, picked_up_at = NOW()`;
    }
    if (status === "delivered") {
      query += `, delivered_at = NOW()`;
    }

    query += ` WHERE id = $2 RETURNING *`;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Delivery not found." });
    }

    // OPTIONAL: sync order status
    if (status === "delivered") {
      await pool.query(
        `UPDATE orders SET status = 'completed' WHERE id = $1`,
        [result.rows[0].order_id]
      );
    }

    res.json({
      success: true,
      message: "Delivery status updated",
      delivery: result.rows[0]
    });

  } catch (error) {
    console.error("Update Delivery Error:", error);
    res.status(500).json({ error: "Failed to update delivery status" });
  }
};


// 📌 Get Delivery by Order ID
exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT d.*, u.full_name AS agent_name, u.phone AS agent_phone
       FROM deliveries d
       LEFT JOIN users u ON d.delivery_agent_id = u.id
       WHERE d.order_id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No delivery found for this order." });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Get Delivery Error:", error);
    res.status(500).json({ error: "Failed to fetch delivery" });
  }
};


// 📌 Get All Deliveries (Admin)
exports.getAllDeliveries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, o.user_id, u.full_name AS agent_name
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       LEFT JOIN users u ON d.delivery_agent_id = u.id
       ORDER BY d.assigned_at DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get All Deliveries Error:", error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};


// 📌 Get Deliveries for Delivery Agent
exports.getAgentDeliveries = async (req, res) => {
  try {
    const { agentId } = req.params;

    const result = await pool.query(
      `SELECT * FROM deliveries 
       WHERE delivery_agent_id = $1
       ORDER BY assigned_at DESC`,
      [agentId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Agent Deliveries Error:", error);
    res.status(500).json({ error: "Failed to fetch agent deliveries" });
  }
};