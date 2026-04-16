const express = require("express");
const router = express.Router();
const orderController = require("../controllers/ordersController");
const authenticateToken = require("../middleware/auth");

// Create order
router.post("/orders/create", authenticateToken, orderController.createOrder);

// Get all orders of the logged-in user
router.get("/orders/user", authenticateToken, orderController.getUserOrders);

// Get single order
router.get("/orders/:id", authenticateToken, orderController.getOrderById);

// Update order status
router.put("/orders/:id", authenticateToken, orderController.updateOrderStatus);

// Delete order
router.delete("/orders/:id", authenticateToken, orderController.deleteOrder);

// Get all orders (admin only)
router.get("/orders", authenticateToken, orderController.getAllOrders);

// Get all orders (admin only)
router.get("/user-orders", authenticateToken, orderController.getUserOrders);

// Get all orders (admin only)
router.get("/orders-total", authenticateToken, orderController.getTotalOrders);


// Get all orders (admin only)
router.get("/revenue", authenticateToken, orderController.getTotalRevenue);

module.exports = router;
