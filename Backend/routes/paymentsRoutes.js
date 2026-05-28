const express = require("express");
const router = express.Router();

const paymentsController = require("../controllers/paymentsController");
const authenticateToken = require("../middleware/auth");

// ----------------------
// 💳 PAYMENT CRUD
// ----------------------

// Create payment record
router.post(
  "/payments/create",
  authenticateToken,
  paymentsController.createPayment
);

// Get payments by order
router.get(
  "/payments/order/:orderId",
  authenticateToken,
  paymentsController.getPaymentsByOrder
);

// Update payment status
router.put(
  "/payments/:id",
  authenticateToken,
  paymentsController.updatePaymentStatus
);

// Delete payment
router.delete(
  "/payments/:id",
  authenticateToken,
  paymentsController.deletePayment
);

// ----------------------
// 💰 PROCESS PAYMENT (PROMO INCLUDED)
// ----------------------
// router.post(
//   "/payment",
//   authenticateToken,
//   paymentsController.processPayment
// );

// ----------------------
// 📄 PAYMENT SLIP (PDF)
// ----------------------
router.get(
  "/payment-slip/:id",
  authenticateToken,
  paymentsController.generatePaymentSlip
);

// ----------------------
// 📊 REVENUE APIs
// ----------------------

// Monthly revenue
router.get(
  "/revenue/monthly",
  authenticateToken,
  paymentsController.getMonthlyRevenue
);

// Yearly revenue
router.get(
  "/revenue/yearly",
  authenticateToken,
  paymentsController.getYearlyRevenue
);
router.post("/promo/validate", paymentsController.validatePromo);

module.exports = router;