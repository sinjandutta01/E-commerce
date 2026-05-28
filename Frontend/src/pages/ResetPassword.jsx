import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css"

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail"); // get email from previous step

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5002/api/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login"); // redirect to login after reset
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="register-page">

      {/* Left Panel */}
      <div className="left-panel">
        <h2>Forgot your password?</h2>
        <p>Reset your password using the OTP sent to your email</p>
        <img src="images/login.webp" alt="banner" />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-box">

          {/* Logo */}
          <div className="text-center mb-4">
            <img src="images/logo.png" alt="Logo" style={{ width: "120px" }} />
            <h4 className="mt-3 fw-bold">Reset Password</h4>
            <p style={{ fontSize: "14px", color: "#878787" }}>
              Enter OTP and new password
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="alert">{message}</div>
          )}

          {/* Form */}
          <form onSubmit={handleReset}>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-key"></i>
              </span>
              <input
                type="text"
                placeholder="Enter OTP"
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                placeholder="New Password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                placeholder="Confirm Password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-warning w-100 fw-bold" type="submit">
              Reset Password
            </button>

          </form>

          <div className="mt-3 text-center">
            <p>
              Remembered your password?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "#2874f0", cursor: "pointer", fontWeight: "500" }}
              >
                Login here
              </span>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ResetPassword;