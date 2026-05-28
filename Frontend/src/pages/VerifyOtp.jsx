import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem("verifyEmail");

  const handleVerify = async () => {
    // Validation
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    if (!email) {
      setMessage("Session expired. Please register again.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5002/api/auth/verify-email",
        { email, otp }
      );

      setMessage("Email verified successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.message ||
        "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      
      {/* Left Panel */}
      <div className="left-panel">
        <h2>Welcome Back!</h2>
        <p>Login to access your account, orders & wishlist</p>
        <img src="images/login.webp" alt="banner" />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-box" style={{ backgroundColor: "#716b97" }}>
          
          {/* Header */}
          <div className="text-center mb-4">
            <img
              src="images/icon.svg"
              alt="Logo"
              style={{
                height: "80px",
                marginRight: "10px",
                filter: "invert(2000%)"
              }}
            />

            <span
              style={{
                color: "#f8fafc",
                fontWeight: "600",
                fontSize: "22px",
                letterSpacing: "1px",
                fontFamily: "Poppins, sans-serif",
                background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              E-Commerce
            </span>

            <h3 className="text-center mt-2">Verify OTP</h3>
          </div>

          {/* Message */}
          {message && (
            <div className="alert alert-info">{message}</div>
          )}

          {/* OTP Input */}
          <input
            type="text"
            maxLength="6"
            autoFocus
            className="form-control mb-3"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {/* Button */}
          <button
            className="btn btn-success w-100"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;