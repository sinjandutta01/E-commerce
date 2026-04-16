import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import "./style.css"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);
      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      console.log("Decoded User:", decoded);

      setMessage("Login Successful!");

      if (decoded.role === "admin") navigate("/admin/dashboard");
      else if (decoded.role === "customer") navigate("/userdashboard");
      else navigate("/home");
    } catch (error) {
      setMessage(error?.response?.data?.message ?? error?.message ?? "Login Failed");
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

          {/* Logo */}
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
            <h4 className="mt-3 fw-bold">Login</h4>
            <p style={{ fontSize: "14px", color: "#0c0c0c" }}>
              Get access to your account
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="alert">{message}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

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
              Login
            </button>

          </form>

          {/* Links */}
          <div className="mt-3 text-center">

            <p>
              New to platform?{" "}
              <span
                onClick={() => navigate("/register")}
                style={{ color: "#0c0c0c", cursor: "pointer", fontWeight: "500" }}
              >
                Create account
              </span>
            </p>

            <p>
              Forgot password?{" "}
              <Link to="/forgot-password" style={{ color: "#0d0d0e" }}>
                Reset here
              </Link>
            </p>

          </div>

        </div>
      </div>

    </div>
  );
}
