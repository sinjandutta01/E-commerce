const pool = require("../db");
const PDFDocument = require("pdfkit");

// ------------------------------
// 📌 CREATE PAYMENT
// ------------------------------
// --------------------------
exports.createPayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_id, method, transaction_id, promo_code } = req.body;

    await client.query("BEGIN");

    // 1. Get order (source of truth)
    const orderRes = await client.query(
      `SELECT total_amount, payment_status FROM orders WHERE id = $1`,
      [order_id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const total = Number(orderRes.rows[0].total_amount);

    if (orderRes.rows[0].payment_status === "paid") {
      return res.status(400).json({ error: "Order already paid" });
    }

    let discount = 0;

    // 2. Promo validation
    if (promo_code) {
      const promoRes = await client.query(
        `SELECT * FROM promo_codes WHERE code = $1 AND is_active = true`,
        [promo_code]
      );

      if (promoRes.rows.length > 0) {
        const promo = promoRes.rows[0];

        if (promo.discount_type === "percent") {
          discount = (total * promo.discount_value) / 100;

          if (promo.max_discount) {
            discount = Math.min(discount, promo.max_discount);
          }
        } else {
          discount = promo.discount_value;
        }
      }
    }

    // 3. Final amount safety check
    let finalAmount = total - discount;

    if (finalAmount < 0) finalAmount = 0;

    // 4. Insert payment
    const paymentRes = await client.query(
      `INSERT INTO payments 
       (order_id, amount, method, transaction_id, promo_code, discount_amount)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [order_id, finalAmount, method, transaction_id, promo_code, discount]
    );

    // 5. Update order
    await client.query(
      `UPDATE orders 
       SET payment_status='paid', discount_amount=$1, promo_code=$2 
       WHERE id=$3`,
      [discount, promo_code, order_id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      payment: paymentRes.rows[0],
      discount,
      finalAmount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create Payment Error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  } finally {
    client.release();
  }
};

// ------------------------------
// 📌 GET PAYMENTS BY ORDER
// ------------------------------
exports.getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT * FROM payments WHERE order_id = $1`,
      [orderId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Payments Error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// ------------------------------
// 📌 UPDATE PAYMENT STATUS
// ------------------------------
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transaction_id } = req.body;

    const result = await pool.query(
      `UPDATE payments 
       SET status = $1, transaction_id = $2
       WHERE id = $3
       RETURNING *`,
      [status, transaction_id, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({ error: "Failed to update payment" });
  }
};

// ------------------------------
// 📌 DELETE PAYMENT
// ------------------------------
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM payments WHERE id = $1`, [id]);

    res.json({ success: true, message: "Payment deleted" });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({ error: "Failed to delete payment" });
  }
};

// ------------------------------
// 💳 PROCESS PAYMENT WITH PROMO
// ------------------------------
exports.processPayment = async (req, res) => {
  try {
    const { order_id, payment_method, promo_code } = req.body;

    // 1. Get order
    const orderRes = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [order_id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderRes.rows[0];
    let discount = 0;

    // 2. Check promo code
    if (promo_code) {
      const promoRes = await pool.query(
        "SELECT * FROM promo_codes WHERE code = $1 AND is_active = true",
        [promo_code]
      );

      if (promoRes.rows.length > 0) {
        const promo = promoRes.rows[0];

        if (promo.discount_type === "percentage") {
          discount =
            (Number(order.total_amount) * Number(promo.discount_value)) / 100;
        } else {
          discount = Number(promo.discount_value);
        }

        if (promo.max_discount) {
          discount = Math.min(discount, promo.max_discount);
        }
      }
    }

    const finalAmount = Number(order.total_amount) - discount;

    // 3. Update order
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = 'completed',
           payment_method = $1,
           promo_code = $2,
           discount_amount = $3,
           total_amount = $4
       WHERE id = $5
       RETURNING *`,
      [payment_method, promo_code, discount, finalAmount, order_id]
    );

    res.json({
      success: true,
      message: "Payment successful",
      order: result.rows[0],
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// ------------------------------
// 📄 GENERATE PAYMENT SLIP
// ------------------------------


exports.generatePaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------
    // ORDER DETAILS
    // -------------------------
    const orderRes = await pool.query(
  `SELECT 
      o.id,
      o.total_amount,
      o.discount,
      o.final_amount,
      o.payment_status,
      o.payment_method,

      u.full_name AS customer_name,
      u.phone AS user_phone,

      a.address_line1,
      a.address_line2,
      a.city,
      a.state,
      a.pincode,
      a.country,
      a.phone AS address_phone

   FROM orders o
   JOIN users u ON o.user_id = u.id
   JOIN addresses a ON o.address_id = a.id
   WHERE o.id = $1`,
  [id]
);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderRes.rows[0];

    // -------------------------
    // ORDER ITEMS
    // -------------------------
    const itemsRes = await pool.query(
      `SELECT 
          oi.quantity,
          oi.price_at_purchase,
          p.name AS product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const items = itemsRes.rows;

    // -------------------------
    // CALCULATIONS
    // -------------------------
    const subtotal = Number(order.total_amount || 0);
    const discount = Number(order.discount_amount || 0);
    const finalAmount = subtotal - discount;

    // -------------------------
    // PDF SETUP
    // -------------------------
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=PaymentSlip_${id}.pdf`
    );

    doc.pipe(res);

    // -------------------------
    // HEADER
    // -------------------------
    doc.fontSize(20).text("PAYMENT SLIP", { align: "center" });
    doc.moveDown(2);

    // -------------------------
    // ORDER INFO
    // -------------------------
    doc.fontSize(12);
    doc.text(`Order ID: ${order.id}`);
    doc.text(`Customer: ${order.customer_name}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Address: ${order.address_line}`);
    doc.moveDown();

    doc.text(`Payment Status: ${order.payment_status || "N/A"}`);
    doc.text(`Payment Method: ${order.payment_method || "N/A"}`);
    doc.moveDown();

    // -------------------------
    // ITEMS
    // -------------------------
    doc.fontSize(14).text("Items:");
    doc.moveDown(0.5);

    items.forEach((item, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${item.product_name} | Qty: ${item.quantity} | ₹${item.price_at_purchase}`
      );
    });

    doc.moveDown();

    // -------------------------
    // SUMMARY
    // -------------------------
    doc.fontSize(12);
    doc.text(`Subtotal: ₹${subtotal}`);
    doc.text(`Discount: -₹${discount}`);
    doc.text(`Total Payable: ₹${finalAmount}`);

    doc.moveDown(2);
    doc.text("Thank you for your purchase!", { align: "center" });

    doc.end();

  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).json({ error: "Failed to generate slip" });
  }
};

// ------------------------------
// 📊 MONTHLY REVENUE
// ------------------------------
exports.getMonthlyRevenue = async (req, res) => {
  try {
   const result = await pool.query(`
  SELECT 
    DATE_TRUNC('month', created_at) AS month,
    SUM(final_amount) AS revenue
  FROM orders
  WHERE payment_status = 'paid'
  GROUP BY DATE_TRUNC('month', created_at)
  ORDER BY DATE_TRUNC('month', created_at)
`);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching revenue" });
  }
};

// ------------------------------
// 📅 YEARLY REVENUE
// ------------------------------
exports.getYearlyRevenue = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM created_at)::INT AS year,
        SUM(final_amount) AS revenue
      FROM orders
      WHERE payment_status = 'paid'
      GROUP BY EXTRACT(YEAR FROM created_at)
      ORDER BY EXTRACT(YEAR FROM created_at)
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Yearly Revenue Error:", err);
    res.status(500).json({ message: "Error fetching revenue" });
  }
};
exports.validatePromo = async (req, res) => {
  try {
    const { code, order_amount } = req.body;

    const result = await pool.query(
      `SELECT * FROM promo_codes WHERE code=$1 AND is_active=true`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, message: "Invalid promo code" });
    }

    const promo = result.rows[0];

    // expiry check
    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
      return res.json({ valid: false, message: "Promo expired" });
    }

    // min order check
    if (order_amount < promo.min_order_amount) {
      return res.json({
        valid: false,
        message: `Minimum order ₹${promo.min_order_amount} required`,
      });
    }

    let discount = 0;

    if (promo.discount_type === "percent") {
      discount = (order_amount * promo.discount_value) / 100;

      if (promo.max_discount) {
        discount = Math.min(discount, promo.max_discount);
      }
    } else {
      discount = promo.discount_value;
    }

    res.json({
      valid: true,
      discount,
      finalAmount: order_amount - discount,
      promo,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Validation failed" });
  }
};