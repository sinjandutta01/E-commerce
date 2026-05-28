const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/auth"); // Your authentication middleware
const upload = require('../middleware/uplaodController'); // Multer file upload setup
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getTotalProducts,
    getProductsPerCategory
} = require('../controllers/productsController');

// CRUD Routes with Image Upload and Authentication

// Create a new product (with image upload)
router.post('/products/create', authenticateToken, upload.single('image'), createProduct);

// Get all products
router.get('/products',getAllProducts);

// Get a product by ID
router.get('/products/:id', authenticateToken, getProductById);

// Update a product (with image upload)
router.put('/products/:id', authenticateToken, upload.single('image'), updateProduct);

// Delete a product
router.delete('/products/:id', authenticateToken, deleteProduct);

router.get('/total',authenticateToken,getTotalProducts);
router.get("/products-per-category", authenticateToken, getProductsPerCategory);


module.exports = router;
