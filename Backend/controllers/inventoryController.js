const pool = require('../db');

// --------------------------
// CREATE / ADD INVENTORY
// --------------------------
const addInventory = async (req, res) => {
    const { product_id, quantity } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: "product_id is required" });
    }

    try {
        // Check if product exists
        const productCheck = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [product_id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if inventory already exists for product
        const existing = await pool.query(
            "SELECT * FROM product_inventory WHERE product_id = $1",
            [product_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "Inventory already exists for this product"
            });
        }

        const result = await pool.query(
            `INSERT INTO product_inventory (product_id, quantity)
             VALUES ($1, $2)
             RETURNING *`,
            [product_id, quantity || 0]
        );

        res.status(201).json({
            message: "Inventory added successfully",
            inventory: result.rows[0]
        });

    } catch (err) {
        console.error("Add inventory error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// GET ALL INVENTORY
// --------------------------
const getAllInventory = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pi.*, p.name AS product_name
             FROM product_inventory pi
             JOIN products p ON pi.product_id = p.id
             ORDER BY pi.id ASC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Fetch inventory error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// GET INVENTORY BY PRODUCT ID
// --------------------------
const getInventoryByProduct = async (req, res) => {
    const { product_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT pi.*, p.name AS product_name
             FROM product_inventory pi
             JOIN products p ON pi.product_id = p.id
             WHERE pi.product_id = $1`,
            [product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inventory not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Fetch inventory error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// UPDATE INVENTORY
// --------------------------
const updateInventory = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const result = await pool.query(
            `UPDATE product_inventory
             SET quantity = $1
             WHERE id = $2
             RETURNING *`,
            [quantity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inventory not found" });
        }

        res.json({
            message: "Inventory updated successfully",
            inventory: result.rows[0]
        });

    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// DELETE INVENTORY
// --------------------------
const deleteInventory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM product_inventory WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inventory not found" });
        }

        res.json({ message: "Inventory deleted successfully" });

    } catch (err) {
        console.error("Delete inventory error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    addInventory,
    getAllInventory,
    getInventoryByProduct,
    updateInventory,
    deleteInventory
};
