const pool = require("../db");

// 📌 Create Notification
const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      category_id,
      type,
      message,
      channel,
      expires_at
    } = req.body;

    // Validation
    if (!user_id || !type || !message || (!product_id && !category_id)) {
      return res.status(400).json({
        error: "Please provide user, type, message and at least product or category."
      });
    }

    const result = await pool.query(
      `INSERT INTO notifications (
        user_id, product_id, category_id, type, message, channel, expires_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        user_id,
        product_id || null,
        category_id || null,
        type,
        message,
        channel || "email",
        expires_at || null
      ]
    );

    console.log("Notification created:", result.rows[0]);

    res.status(201).json({
      success: true,
      notification: result.rows[0]
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

// 📌 Get All Notifications for a User
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) return res.status(400).json({ error: "User ID is required." });

    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No notifications found for this user." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// 📌 Get Single Notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const result = await pool.query(
      "SELECT * FROM notifications WHERE id = $1",
      [notificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Notification Error:", error);
    res.status(500).json({ error: "Failed to fetch notification" });
  }
};

// 📌 Update Notification
const updateNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { type, message, channel, is_read, is_sent, expires_at } = req.body;

    if (!notificationId) return res.status(400).json({ error: "Notification ID is required." });

    const result = await pool.query(
      `UPDATE notifications SET 
        type = COALESCE($1, type),
        message = COALESCE($2, message),
        channel = COALESCE($3, channel),
        is_read = COALESCE($4, is_read),
        is_sent = COALESCE($5, is_sent),
        expires_at = COALESCE($6, expires_at)
      WHERE id = $7 RETURNING *`,
      [type, message, channel, is_read, is_sent, expires_at, notificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// 📌 Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (!notificationId) return res.status(400).json({ error: "Notification ID is required." });

    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 RETURNING *",
      [notificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const result = await pool.query(`SELECT u.full_name,p.name as product_name,c.name category_name,
n.type,n.message,n.channel,n.created_at,n.expires_at
FROM notifications n 
left join users u on n.user_id= u.id
left join products p on p.id=n.product_id
left join categories c on c.id=n.category_id
ORDER BY n.created_at DESC`);    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

module.exports = {
  createNotification,
  getUserNotifications, 
    getNotificationById,
    updateNotification,
    deleteNotification,
    getAllNotifications
};