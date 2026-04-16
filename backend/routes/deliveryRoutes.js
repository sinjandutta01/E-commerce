const express = require("express");
const router = express.Router();
const authenticateToken=require("../middleware/auth")

const deliveryController = require("../controllers/deliveryController");


// 📌 Assign delivery agent (Admin)
router.post("/assign", authenticateToken, deliveryController.assignDelivery);


// 📌 Update delivery status (Delivery Agent)
router.put("/:id/status", authenticateToken,deliveryController.updateDeliveryStatus);


// 📌 Get delivery by order ID (User/Admin)
router.get("/order/:orderId", authenticateToken, deliveryController.getDeliveryByOrder);



// 📌 Get all deliveries (Admin)
router.get("/",authenticateToken, deliveryController.getAllDeliveries);


// 📌 Get deliveries for a delivery agent
router.get("/agent/:agentId", authenticateToken, deliveryController.getAgentDeliveries);


module.exports = router;