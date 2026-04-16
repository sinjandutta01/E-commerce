const pool = require("../db");


// 📌 Create Delivery Profile
exports.createDeliveryProfile = async (req, res) => {
  try {
    const { user_id, vehicle_type, vehicle_number, is_available, current_location } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if profile already exists
    const existing = await pool.query(
      "SELECT * FROM delivery_profiles WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Delivery profile already exists for this user" });
    }

    const result = await pool.query(
      `INSERT INTO delivery_profiles (
        user_id, vehicle_type, vehicle_number, is_available, current_location
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        user_id,
        vehicle_type || null,
        vehicle_number || null,
        is_available ?? true,
        current_location || null
      ]
    );

    res.status(201).json({
      success: true,
      profile: result.rows[0]
    });

  } catch (error) {
    console.error("Create Delivery Profile Error:", error);
    res.status(500).json({ error: "Failed to create delivery profile" });
  }
};


// 📌 Get Profile by User ID
exports.getProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT dp.*, u.full_name, u.phone, u.email
       FROM delivery_profiles dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};


// 📌 Update Vehicle Info
exports.updateVehicleInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { vehicle_type, vehicle_number } = req.body;

    const result = await pool.query(
      `UPDATE delivery_profiles
       SET vehicle_type = $1,
           vehicle_number = $2
       WHERE user_id = $3
       RETURNING *`,
      [vehicle_type, vehicle_number, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      success: true,
      profile: result.rows[0]
    });

  } catch (error) {
    console.error("Update Vehicle Error:", error);
    res.status(500).json({ error: "Failed to update vehicle info" });
  }
};


// 📌 Update Availability (Online/Offline toggle)
exports.updateAvailability = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_available } = req.body;

    const result = await pool.query(
      `UPDATE delivery_profiles
       SET is_available = $1
       WHERE user_id = $2
       RETURNING *`,
      [is_available, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      success: true,
      message: "Availability updated",
      profile: result.rows[0]
    });

  } catch (error) {
    console.error("Availability Error:", error);
    res.status(500).json({ error: "Failed to update availability" });
  }
};


// 📌 Update Current Location (for live tracking)
exports.updateLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { current_location } = req.body;

    if (!current_location) {
      return res.status(400).json({ error: "Location is required" });
    }

    const result = await pool.query(
      `UPDATE delivery_profiles
       SET current_location = $1
       WHERE user_id = $2
       RETURNING *`,
      [current_location, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      success: true,
      message: "Location updated",
      profile: result.rows[0]
    });

  } catch (error) {
    console.error("Location Update Error:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
};


// 📌 Get All Delivery Agents (Admin)
exports.getAllDeliveryAgents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dp.*, u.full_name, u.phone, u.email
       FROM delivery_profiles dp
       JOIN users u ON dp.user_id = u.id
       ORDER BY dp.is_available DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get All Agents Error:", error);
    res.status(500).json({ error: "Failed to fetch delivery agents" });
  }
};