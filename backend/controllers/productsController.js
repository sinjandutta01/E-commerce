const pool = require('../db');
const upload = require('../middleware/uplaodController'); // Import multer setup

// --------------------------
// CREATE PRODUCT
// --------------------------
const createProduct = async (req, res) => {
    const { name, description, price, category_id } = req.body;
    const image = req.file;

    if (!name || !price) {
        return res.status(400).json({ message: "Name and price are required" });
    }

    if (!image) {
        return res.status(400).json({ message: "Image file is required" });
    }

    // Ensure category_id exists in the categories table
    const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1', [category_id]
    );

    if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ message: "Invalid category ID" });
    }

    const image_url = `/uploads/${image.filename}`;

    try {
        const result = await pool.query(
            `INSERT INTO products (name, description, price, image_url, category_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, description, price, image_url, category_id]
        );

        res.status(201).json({
            message: "Product created successfully",
            product: result.rows[0]
        });
    } catch (err) {
        console.error("Product creation error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// UPDATE PRODUCT
// --------------------------
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id } = req.body;
  const image = req.file;

  try {
    // Get current image_url if no new image is uploaded
    let image_url = image ? `/uploads/${image.filename}` : null;
    if (!image_url) {
      const existingProduct = await pool.query(
        'SELECT image_url FROM products WHERE id = $1',
        [Number(id)]
      );

      if (existingProduct.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      image_url = existingProduct.rows[0].image_url;
    }

    // Validate category_id if provided
    let categoryIdNumber = null;
    if (category_id) {
      const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1',
        [Number(category_id)]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      categoryIdNumber = Number(category_id);
    }

    // Build query dynamically depending on whether category_id is included
    let query = '';
    let params = [];

    if (categoryIdNumber !== null) {
      query = `
        UPDATE products
        SET name=$1, description=$2, price=$3, image_url=$4, category_id=$5, updated_at=NOW()
        WHERE id=$6
        RETURNING *
      `;
      params = [name, description, Number(price), image_url, categoryIdNumber, Number(id)];
    } else {
      query = `
        UPDATE products
        SET name=$1, description=$2, price=$3, image_url=$4, updated_at=NOW()
        WHERE id=$5
        RETURNING *
      `;
      params = [name, description, Number(price), image_url, Number(id)];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// --------------------------
// GET ALL PRODUCTS
// --------------------------
const getAllProducts = async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query; // Default to page 1, 10 items per page
    const offset = (page - 1) * pageSize;

    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             ORDER BY p.id ASC
             LIMIT $1 OFFSET $2`, 
            [pageSize, offset]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Fetch products error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --------------------------
// GET PRODUCT BY ID
// --------------------------
const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Fetch product error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// --------------------------
// DELETE PRODUCT
// --------------------------
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM products WHERE id=$1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete product error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
const getTotalProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS totalProducts FROM products");
    res.json({ totalProducts: parseInt(result.rows[0].totalproducts, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching total products" });
  }
};
const getProductsPerCategory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.name AS category,
        COUNT(p.id) AS total
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Category chart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getTotalProducts,
    getProductsPerCategory
};
