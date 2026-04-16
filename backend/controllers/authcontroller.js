const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ------------------------
// REGISTER
// ------------------------
const register = async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  if (!full_name || !email || !password || !phone) {
    return res.status(400).json({ 
      message: 'full_name, email, password, phone are required' 
    });
  }

  try {
    // Check if email exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
      


    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const email_otp = otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false, digits: true, lowerCaseAlphabets: true });
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + 15 * 60 * 1000); // OTP valid for 15 minutes

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone,email_otp, otp_expiry, is_verified)
       VALUES ($1, $2, $3, $4,$5,$6,$7)
       RETURNING *`,
      [full_name, email, password_hash, phone,email_otp,expiry,false]
    );
    const transporter = nodemailer.createTransport({service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } }); 
        const mailOptions = { from: process.env.EMAIL_USER, to: email, subject: 'Your OTP for Email Verification', text: `Your OTP is ${email_otp}. It is valid for 15 minutes.` };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;    
    try {
        const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);   
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Email not found" });
        }

        const storedOtp = user.rows[0].email_otp;
        const otpExpiry = user.rows[0].otp_expiry;

        if (storedOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > otpExpiry) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        await pool.query('UPDATE users SET is_verified=$1 WHERE email=$2', [true, email]);

        res.json({ message: "Email verified successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ------------------------
// LOGIN
// ------------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    // find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0)
      return res.status(400).json({ message: 'Invalid email or password' });

    const user = userResult.rows[0];

    

   if (user.is_verified !== true) {
  return res.status(403).json({
    message: 'Please verify your email before logging in'
  });
}

    // compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    // create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '1hr' }
    );

    // safe user info
    // Define the user info to be sent to the frontend (without sensitive data like password)
    const userInfo = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
    };

    res.json({ 
      message: 'Login successful', 
      token, 
      user: userInfo 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};
// ------------------------
// GET TOTAL USERS
// ------------------------
const getTotalUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    const totalUsers = parseInt(result.rows[0].total, 10);

    res.json({ totalUsers });
  } catch (err) {
    console.error("Error fetching total users:", err);
    res.status(500).json({ message: 'Server error while counting users' });
  }
};
const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true });
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + 15 * 60 * 1000); // OTP valid for 15 minutes

    await pool.query(
      "UPDATE users SET reset_password_otp=$1, otp_expiry=$2 WHERE email=$3",
      [otp, expiry, email]
    );

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otp}. It is valid for 15 minutes.`
    });

    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending OTP" });
  }
};
const resetPassword = async (req, res) => {
  const { email, otp, new_password, confirm_password } = req.body;

  if (new_password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = userResult.rows[0];

    if (user.reset_password_otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password_hash=$1, reset_password_otp=NULL, otp_expiry=NULL WHERE email=$2",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error resetting password" });
  }
};


// 📌 Get All Users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, is_verified, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};
const getTotalCustomer = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'customer'"
    );

    res.json({ totalCustomers: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching customers" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, role } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET full_name=$1, phone=$2, role=$3
       WHERE id=$4
       RETURNING id, full_name, email, phone, role`,
      [full_name, phone, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = {
  register,
  login,getTotalUsers,
  verifyEmail,
  resetPassword,sendPasswordResetOtp,
  getAllUsers,
  getTotalCustomer,
  deleteUser,
  updateUser
};
