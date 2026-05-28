const pool = require('../db');

// ----------------------
// CREATE CATEGORY
// ----------------------
const createCategory = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Category name is required" });
    }

    try {
        const exists = await pool.query(
            "SELECT * FROM categories WHERE name = $1",
            [name]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const result = await pool.query(
            `INSERT INTO categories (name, description)
             VALUES ($1, $2)
             RETURNING *`,
            [name, description]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: result.rows[0]
        });

    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// ----------------------
// GET ALL CATEGORIES
// ----------------------
const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// ----------------------
// GET CATEGORY BY ID
// ----------------------
const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM categories WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Error fetching category:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// ----------------------
// UPDATE CATEGORY
// ----------------------
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const result = await pool.query(
            `UPDATE categories 
             SET name = $1, description = $2
             WHERE id = $3
             RETURNING *`,
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({
            message: "Category updated successfully",
            category: result.rows[0]
        });

    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// ----------------------
// DELETE CATEGORY
// ----------------------
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });

    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// GET CATEGORIES WITH PRODUCTS
// --------------------------
const getCategoriesWithProducts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
    c.id AS category_id,
    c.name AS category_name,
    c.description AS category_description,
    p.id AS product_id,
    p.name AS product_name,
    p.description AS product_description,
    p.price,
    p.image_url
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
ORDER BY c.id, p.id;
`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Fetch categories with products error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoriesWithProducts
};
