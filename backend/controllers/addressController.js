const pool = require("../db");

// 📌 Add New Address
exports.createAddress = async (req, res) => {
  try {
    const {
      user_id,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country,
      phone,
      is_default
    } = req.body;

    // Validation: Ensure all required fields are present
    if (!user_id || !address_line1 || !city || !state || !pincode || !country || !phone) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    console.log("Creating address for user:", user_id);

    // If default address → remove old default
    if (is_default) {
      console.log("Setting this as default address, removing old default for user:", user_id);
      await pool.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [user_id]);
    }

    // Insert new address into the database
    const result = await pool.query(
      `INSERT INTO addresses (
        user_id, address_line1, address_line2, city, state, pincode, country, phone, is_default
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        user_id, 
        address_line1, 
        address_line2, 
        city, 
        state, 
        pincode, 
        country, 
        phone, 
        is_default || false
      ]
    );

    console.log("Address created successfully:", result.rows[0]);
    res.status(201).json({ success: true, address: result.rows[0] });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ error: "Failed to add address" });
  }
};

// 📌 Get All Addresses of a User
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if userId is valid
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    console.log("Fetching addresses for user:", userId);

    const result = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No addresses found for this user." });
    }

    console.log("Addresses fetched successfully:", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

// 📌 Update Address
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country,
      phone,
      is_default
    } = req.body;

    // Validation: Ensure the address ID and required fields are present
    if (!addressId) {
      return res.status(400).json({ error: "Address ID is required." });
    }

    if (!address_line1 || !city || !state || !pincode || !country || !phone) {
      return res.status(400).json({ error: "Missing required fields to update address." });
    }

    console.log("Updating address with ID:", addressId);

    // If marking as default, remove old default address
    if (is_default) {
      const old = await pool.query(
        `SELECT user_id FROM addresses WHERE id=$1`,
        [addressId]
      );

      if (old.rows.length > 0) {
        console.log("Removing old default address for user:", old.rows[0].user_id);
        await pool.query(
          `UPDATE addresses SET is_default=false WHERE user_id=$1`,
          [old.rows[0].user_id]
        );
      }
    }

    const result = await pool.query(
      `UPDATE addresses SET 
        address_line1=$1,
        address_line2=$2,
        city=$3,
        state=$4,
        pincode=$5,
        country=$6,
        phone=$7,
        is_default=$8
      WHERE id=$9 RETURNING *`,
      [
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        country,
        phone,
        is_default,
        addressId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Address not found for the given ID." });
    }

    console.log("Address updated successfully:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
};

// 📌 Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    // Validation: Ensure address ID is provided
    if (!addressId) {
      return res.status(400).json({ error: "Address ID is required." });
    }

    console.log("Deleting address with ID:", addressId);

    const result = await pool.query(`DELETE FROM addresses WHERE id = $1 RETURNING *`, [addressId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Address not found for the given ID." });
    }

    console.log("Address deleted successfully:", result.rows[0]);
    res.json({ success: true, message: "Address deleted successfully." });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: "Failed to delete address" });
  }
};
// 📌 Get single address by ID
exports.getAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;
    const result = await pool.query(
      "SELECT * FROM addresses WHERE id = $1",
      [addressId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Address Error:", error);
    res.status(500).json({ error: "Failed to fetch address" });
  }
};
