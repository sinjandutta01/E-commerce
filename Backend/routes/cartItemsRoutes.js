const express = require('express');
const router = express.Router();
const authenticateToken=require("../middleware/auth")

const {
    addCartItem,
    getCartItems,
    updateCartItem,
    deleteCartItem,
    clearCart
} = require('../controllers/cartItemsController');

// Routes
router.post('/cart-items/add', authenticateToken,addCartItem);
router.get('/cart-items/:cart_id',authenticateToken, getCartItems);
router.put('/cart-items/:id',authenticateToken, updateCartItem);
router.delete('/cart-items/:id',authenticateToken, deleteCartItem);
router.delete('/cart-items/clear/:cart_id',authenticateToken, clearCart);

module.exports = router;
