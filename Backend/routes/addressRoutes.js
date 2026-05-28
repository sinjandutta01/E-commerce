const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const authenticateToken=require("../middleware/auth")

// Add address
router.post("/address/add", authenticateToken,addressController.createAddress);

// Get all addresses for a user
router.get("/address/user/:userId", authenticateToken,addressController.getUserAddresses);

// Update address
router.put("/address/:id", authenticateToken,addressController.updateAddress);

// Delete address
router.delete("/address/:id", authenticateToken,addressController.deleteAddress);

router.get("/address/:id", authenticateToken, addressController.getAddressById);


module.exports = router;
