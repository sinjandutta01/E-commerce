const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const authenticateToken=require("../middleware/auth")


// Create profile
router.post("/delivery",authenticateToken, deliveryController.createDeliveryProfile);

// Get profile
router.get("/delivery/:userId",authenticateToken, deliveryController.getDeliveryProfile);

// Update status
router.put("/delivery/:userId/status",authenticateToken, deliveryController.updateDeliveryStatus);

// Get available partners
router.get("/delivery", authenticateToken, deliveryController.getAvailableDeliveryPartners);
router.post("/assign-order",authenticateToken,deliveryController.assignOrderToDelivery);

router.get("/delivery/orders/:deliveryId",authenticateToken,deliveryController.getDeliveryOrders);


module.exports = router;