import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "./Sidebar.css";
import { HomeIcon, CategoryIcon, ProductIcon, OrderIcon, NotificationIcon, UsersIcon, LogoutIcon, AdminIcon, DeliveryManIcon } from "./icons";

export default function DeliverySidebar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let decoded = null;

  if (token) {
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      {/* <h2 className="logo">Admin</h2> */}

      {/* Profile */}
      <div className="profile">
        {/* <img
          src={decoded?.avatar || "/images/admin.svg"}
          alt="User Avatar"
          className="user-avatar"
          onError={(e) => (e.target.src = "/images/admin.svg")}
        /> */}
        <DeliveryManIcon/>
        {/* <AdminIcon/> */}
        <h4 style={{ color: "black", fontWeight: "bold" }}>
          {(decoded?.full_name || "Admin User").toUpperCase()}
        </h4>
      </div>

      {/* Menu */}
      <nav className="menu">
       
      </nav>

      {/* Logout */}
      <div className="logout">
        <button onClick={handleLogout}>
          <LogoutIcon />
          <span style={{ color: "black", fontWeight: "bold" }}>Logout</span>
        </button>
      </div>
    </div>
  );
}