const pool = require("../db");

// 📌 Create Delivery Partner Profile (after user is created)
exports.createDeliveryProfile = async (req, res) => {
  try {
    const { user_id, vehicle_type, vehicle_number } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Check if user exists & is delivery role
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'delivery'",
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid delivery user" });
    }

    // Prevent duplicate profile
    const existing = await pool.query(
      "SELECT * FROM delivery_partners WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Delivery profile already exists" });
    }

    const result = await pool.query(
      `INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, vehicle_type, vehicle_number]
    );

    res.status(201).json({
      success: true,
      delivery_partner: result.rows[0]
    });

  } catch (error) {
    console.error("Create Delivery Profile Error:", error);
    res.status(500).json({ error: "Failed to create delivery profile" });
  }
};
exports.getDeliveryProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      `SELECT dp.*, u.full_name, u.email, u.phone
       FROM delivery_partners dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Delivery profile not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Fetch Delivery Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch delivery profile" });
  }
};
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { current_status, is_available } = req.body;

    const result = await pool.query(
      `UPDATE delivery_partners
       SET current_status = $1,
           is_available = $2
       WHERE user_id = $3
       RETURNING *`,
      [current_status, is_available, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Delivery partner not found" });
    }

    res.json({
      success: true,
      updated: result.rows[0]
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};
exports.getAvailableDeliveryPartners = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dp.*, u.full_name, u.phone
       FROM delivery_partners dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.is_available = true AND dp.current_status = 'idle'`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Fetch Available Delivery Error:", error);
    res.status(500).json({ error: "Failed to fetch delivery partners" });
  }
};


exports.assignOrderToDelivery = async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_id, delivery_partner_id } = req.body;

    await client.query("BEGIN");

    const orderResult = await client.query(
      "SELECT * FROM orders WHERE id=$1",
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const partnerResult = await client.query(
      "SELECT * FROM delivery_partners WHERE id=$1",
      [delivery_partner_id]
    );

    if (partnerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    const partner = partnerResult.rows[0];

    if (!partner.is_available || partner.current_status !== "idle") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Delivery partner is not available",
      });
    }

    await client.query(
      `UPDATE orders
       SET delivery_partner_id=$1,
           status='assigned'
       WHERE id=$2`,
      [delivery_partner_id, order_id]
    );

    await client.query(
      `UPDATE delivery_partners
       SET current_status='busy'
       WHERE id=$1`,
      [delivery_partner_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Order assigned successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Assign order error:", err);
    res.status(500).json({
      message: "Server error while assigning order",
    });
  } finally {
    client.release();
  }
};

exports.getDeliveryOrders = async (req, res) => {
  const { deliveryId } = req.params;

  const result = await pool.query(
    `SELECT o.*, u.full_name as user_name, u.phone, a.address_line1, a.city
     FROM orders o
     JOIN users u ON u.id = o.user_id
     JOIN addresses a ON a.id = o.address_id
     WHERE o.delivery_partner_id = $1
     ORDER BY o.created_at DESC`,
    [deliveryId]
  );

  res.json(result.rows);
};