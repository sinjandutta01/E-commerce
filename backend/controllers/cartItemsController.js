const pool = require('../db');

// --------------------------
// ADD ITEM TO CART
// --------------------------
const addCartItem = async (req, res) => {
    const { cart_id, product_id, quantity } = req.body;

    if (!cart_id || !product_id) {
        return res.status(400).json({ message: "cart_id and product_id are required" });
    }

    try {
        // Check if item already exists → update quantity
        const existing = await pool.query(
            "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
            [cart_id, product_id]
        );

        if (existing.rows.length > 0) {
            const updated = await pool.query(
                `UPDATE cart_items 
                 SET quantity = quantity + $1 
                 WHERE cart_id = $2 AND product_id = $3 
                 RETURNING *`,
                [quantity || 1, cart_id, product_id]
            );

            return res.json({
                message: "Item quantity updated",
                cartItem: updated.rows[0]
            });
        }

        // Insert new cart item
        const result = await pool.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [cart_id, product_id, quantity || 1]
        );

        res.status(201).json({
            message: "Item added to cart",
            cartItem: result.rows[0]
        });

    } catch (err) {
        console.error("Add cart item error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// GET ALL ITEMS FROM CART
// --------------------------
const getCartItems = async (req, res) => {
    const { cart_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT 
  ci.*, 
  p.name, 
  p.price, 
  CONCAT('http://localhost:5002', p.image_url) AS image_url
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.cart_id = $1
`,
            [cart_id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("Fetch cart items error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// UPDATE CART ITEM QUANTITY
// --------------------------
const updateCartItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const result = await pool.query(
            `UPDATE cart_items
             SET quantity = $1
             WHERE id = $2
             RETURNING *`,
            [quantity, id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Cart item not found" });

        res.json({
            message: "Cart item updated",
            cartItem: result.rows[0]
        });

    } catch (err) {
        console.error("Update cart item error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// DELETE CART ITEM
// --------------------------
const deleteCartItem = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM cart_items WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Cart item not found" });

        res.json({ message: "Cart item deleted" });

    } catch (err) {
        console.error("Delete cart item error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// CLEAR ALL ITEMS FROM CART
// --------------------------
const clearCart = async (req, res) => {
    const { cart_id } = req.params;

    try {
        await pool.query(
            "DELETE FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        res.json({ message: "Cart cleared successfully" });

    } catch (err) {
        console.error("Clear cart error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    addCartItem,
    getCartItems,
    updateCartItem,
    deleteCartItem,
    clearCart
};
