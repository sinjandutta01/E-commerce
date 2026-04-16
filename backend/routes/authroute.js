const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getTotalUsers,
  verifyEmail,
  sendPasswordResetOtp,
  resetPassword,
  getAllUsers,
  getTotalCustomer,
  updateUser,      // ✅ ADD
  deleteUser       // ✅ ADD
} = require("../controllers/authcontroller");

const authenticateToken = require("../middleware/auth");

// --------------------
// Auth Routes
// --------------------
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/verify-email', verifyEmail);

// --------------------
// Forgot Password
// --------------------
// Step 1: Request OTP for password reset
router.post('/auth/forgot-password', sendPasswordResetOtp);

// Step 2: Reset password with OTP
router.post('/auth/reset-password', resetPassword);

// --------------------
// Admin Only
// --------------------
router.get('/users', authenticateToken,getAllUsers);


router.get('/customers', authenticateToken,getTotalCustomer);
// --------------------
// Admin User Management
// --------------------
router.put('/users/:id', authenticateToken, updateUser);   // ✏️ UPDATE
router.delete('/users/:id', authenticateToken, deleteUser); // 🗑 DELETE

module.exports = router;