import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
//import "./Register.css"; // Import custom CSS for styling
import "./style.css"

const Register = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      localStorage.setItem("verifyEmail", form.email);
      setMessage("OTP sent to your email!");

      setTimeout(() => {
        navigate("/verify-otp");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="register-page">

      {/* Left Panel */}
      <div className="left-panel">
        <h2>Looks like you're new here!</h2>
        <p>Sign up with your details to get started</p>
        <img src="images/login.webp" alt="banner" />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-box" style={{ backgroundColor: "#716b97" }}>
          <div className="text-center mb-3">
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
            <h4 className="mt-3 fw-bold">Register</h4>
            <p style={{ fontSize: "14px", color: "#0c0c0c" }}>
              Create Account
            </p>
          </div>

          </div>

         

          {message && (
            <div className="alert">{message}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                name="full_name"
                className="form-control"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email Address"
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="Phone Number"
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>

            {/* Button */}
            <button className="btn btn-warning w-100 fw-bold" type="submit">
              Register
            </button>

          </form>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>
              Login
            </span>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;