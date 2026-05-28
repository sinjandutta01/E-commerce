const express = require('express');
const router = express.Router();
const authenticateToken=require("../middleware/auth")

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoriesWithProducts
} = require('../controllers/categoriesController');

// CRUD Routes
router.post('/categories/create',authenticateToken, createCategory);
router.get('/categories',authenticateToken, getAllCategories);
router.get('/categories/:id',authenticateToken, getCategoryById);
router.put('/categories/:id',authenticateToken, updateCategory);
router.delete('/categories/:id',authenticateToken ,deleteCategory);
router.get('/with-products',authenticateToken,getCategoriesWithProducts);


module.exports = router;
