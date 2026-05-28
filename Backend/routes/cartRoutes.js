const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/auth");

const {
    createCart,
    getCartByUser,
    deleteCart,
    getCartItemsByUser
} = require('../controllers/cartController');

router.post('/cart/create', authenticateToken, createCart);

router.get('/cart/user/item', authenticateToken, getCartItemsByUser);

router.get('/cart/user/:user_id', authenticateToken, getCartByUser);

router.delete('/cart/:id', authenticateToken, deleteCart);


module.exports = router;
