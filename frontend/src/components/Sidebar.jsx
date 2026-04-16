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
import { HomeIcon,CategoryIcon,ProductIcon,OrderIcon,NotificationIcon,UsersIcon,LogoutIcon ,AdminIcon} from "./icons";

export default function Sidebar() {
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
        <img
          src={decoded?.avatar || "/images/admin.svg"}
          alt="User Avatar"
          className="user-avatar"
          onError={(e) => (e.target.src = "/images/admin.svg")}
        />
        {/* <AdminIcon/> */}
        <h4 style={{ color: "black", fontWeight: "bold" }}>
  {(decoded?.full_name || "Admin User").toUpperCase()}
</h4>
      </div>

      {/* Menu */}
      <nav className="menu">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <HomeIcon />
          <span style={{color:"black",fontWeight:"bold"}}>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <CategoryIcon />
          <span style={{color:"black",fontWeight:"bold"}}>Category</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <ProductIcon />
          <span style={{color:"black",fontWeight:"bold"}}>Products</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <OrderIcon />
          <span style={{color:"black",fontWeight:"bold"}}>Orders</span>
        </NavLink>
        <NavLink
          to="/admin/create-notifications"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <NotificationIcon />
          <span style={{color:"black",fontWeight:"bold"}}>Notification</span>
        </NavLink>

        <NavLink
          to="/admin/allusers"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <UsersIcon/>
          <span style={{color:"black",fontWeight:"bold"}}>Users</span>
        </NavLink>

        

       

        
      </nav>

      {/* Logout */}
      <div className="logout">
        <button onClick={handleLogout}>
          <LogoutIcon/>
          <span style={{color:"black",fontWeight:"bold"}}>Logout</span>
        </button>
      </div>
    </div>
  );
}