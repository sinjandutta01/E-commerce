const express = require('express');
const router = express.Router();
const authenticateToken=require("../middleware/auth")
const {
    createNotification,
    getUserNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getAllNotifications
   
} = require('../controllers/notificationController');


// Routes
router.post('/notifications', authenticateToken, createNotification);
router.get('/notifications/user/:userId', authenticateToken, getUserNotifications);
router.get('/notifications/:id', authenticateToken, getNotificationById);
router.put('/notifications/:id', authenticateToken, updateNotification);
router.delete('/notifications/:id', authenticateToken, deleteNotification);
router.get('/notifications', authenticateToken, getAllNotifications);



module.exports = router;