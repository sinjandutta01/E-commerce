import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5002/api/auth/forgot-password",
        { email }
      );
      setMessage(res.data.message);
      localStorage.setItem("resetEmail", email); // store email for next step
      setTimeout(() => {
        navigate("/reset-password"); // navigate to OTP + new password page
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Left Panel */}
      <div className="left-panel">
        <h2>Forgot your password?</h2>
        <p>Enter your email to receive a password reset OTP</p>
        <img src="images/login.webp" alt="banner" />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-box" style={{ backgroundColor: "#716b97" }}>

          <div className="text-center mb-4">
           <img
              src="images/icon.svg"
              alt="Logo"
              style={{
                height: "80px",
                marginRight: "10px",
                filter: "invert(2000%)" // makes it white

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
            <h4 className="mt-3 fw-bold">Forgot Password</h4>
            <p style={{ fontSize: "14px", color: "#0a0a0a" }}>
              We'll send an OTP to your email
            </p>
          </div>

          {message && <div className="alert">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 fw-bold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p>
              Remembered your password?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "#4b0707", cursor: "pointer", fontWeight: "500" }}
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

export default ForgotPassword;