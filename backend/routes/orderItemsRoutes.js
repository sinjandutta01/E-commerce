const express = require("express");
const router = express.Router();
const orderItemsController = require("../controllers/order_itemsController");
const authenticateToken=require("../middleware/auth")

// Add item to order
router.post("/order-items/add", authenticateToken,orderItemsController.addOrderItem);

// Get all items for an order
router.get("/order-items/order/:orderId", authenticateToken,orderItemsController.getOrderItems);

// Update order item
router.put("/order-items/:id",authenticateToken, orderItemsController.updateOrderItem);

// Delete order item
router.delete("/order-items/:id", authenticateToken,orderItemsController.deleteOrderItem);

module.exports = router;
