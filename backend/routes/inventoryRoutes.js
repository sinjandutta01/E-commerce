const express = require('express');
const router = express.Router();
const authenticateToken=require("../middleware/auth")
const {
    addInventory,
    getAllInventory,
    getInventoryByProduct,
    updateInventory,
    deleteInventory
} = require('../controllers/inventoryController');

// Routes
router.post('/inventory/add',authenticateToken, addInventory);
router.get('/inventory',authenticateToken, getAllInventory);
router.get('/inventory/:product_id',authenticateToken, getInventoryByProduct);
router.put('/inventory/:id',authenticateToken, updateInventory);
router.delete('/inventory/:id', authenticateToken,deleteInventory);

module.exports = router;
