const pool = require("../db");

// 📌 Create Order
exports.createOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { address_id, total_amount, discount = 0 } = req.body;

    if (!address_id) {
      return res.status(400).json({ error: "Address ID is required" });
    }

    // ✅ Calculate final amount
    const final_amount = total_amount - discount;

    const result = await pool.query(
      `INSERT INTO orders 
       (user_id, address_id, total_amount, discount, final_amount, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'unpaid')
       RETURNING *`,
      [user_id, address_id, total_amount || 0, discount, final_amount]
    );

    res.status(201).json({ success: true, order: result.rows[0] });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// 📌 Get all orders of a user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth middleware

    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 📌 Get single order by ID (with address details)
exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id); // Ensure it's an integer
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const result = await pool.query(
      `SELECT o.*, 
              a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country, a.phone
       FROM orders o
       JOIN addresses a ON o.address_id = a.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// 📌 Update order status (admin or system)
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const { status, payment_status } = req.body;

    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, payment_status = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, payment_status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// 📌 Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const result = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING *",
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

// 📌 Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    // Optional: check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(`
  SELECT 
    o.*,
    u.email AS user_email,

    a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country, a.phone,

    p.name AS product_name,
    p.price AS product_price,
    c.name AS category_name,
    oi.quantity

  FROM orders o

  JOIN users u ON o.user_id = u.id
  JOIN addresses a ON o.address_id = a.id

  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  LEFT JOIN categories c ON p.category_id = c.id

  ORDER BY o.id DESC
`);


    res.json(result.rows);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};




// Get all orders for a user with products, category, and payment details
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id; // assuming you have auth middleware setting req.user

  try {
    // Fetch orders
    const ordersRes = await pool.query(
      `SELECT o.id AS order_id, o.total_amount, o.status AS order_status, 
              o.payment_status, o.payment_method, o.created_at AS order_date,
              a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country, a.phone
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const orders = ordersRes.rows;

    // Fetch order items for all orders
    const orderIds = orders.map(o => o.order_id);
    if (orderIds.length === 0) {
      return res.json({ orders: [] });
    }

    const orderItemsRes = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
              p.name AS product_name, p.image_url, p.category_id,
              c.name AS category_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE oi.order_id = ANY($1::int[])`,
      [orderIds]
    );

    const orderItems = orderItemsRes.rows;

    // Fetch payments for all orders
    const paymentsRes = await pool.query(
      `SELECT id AS payment_id, order_id, amount, method, status, transaction_id, created_at
       FROM payments
       WHERE order_id = ANY($1::int[])`,
      [orderIds]
    );

    const payments = paymentsRes.rows;

    // Combine everything
    const orderMap = orders.map(order => {
      const items = orderItems.filter(oi => oi.order_id === order.order_id);
      const payment = payments.find(p => p.order_id === order.order_id) || null;

      return {
        ...order,
        items: items.map(i => ({
          product_id: i.product_id,
          name: i.product_name,
          category_id: i.category_id,
          category_name: i.category_name,
          quantity: i.quantity,
          price: i.price_at_purchase,
          image_url: i.image_url,
        })),
        payment,
      };
    });

    res.json({ orders: orderMap });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getTotalOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS totalOrders FROM orders");
    res.json({ totalOrders: parseInt(result.rows[0].totalorders, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching total orders" });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const result = await pool.query("SELECT COALESCE(SUM(total_amount),0) AS totalRevenue FROM orders");
    res.json({ totalRevenue: parseFloat(result.rows[0].totalrevenue) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching total revenue" });
  }
};




