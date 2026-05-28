import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = ({ children, roles = [] }) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token); // Decode token to get user info

    // Optional: role check
    // if (roles.length > 0 && !roles.includes(decoded.role)) {
    //   return <Navigate to="/unauthorized" replace />; // Redirect if role not allowed
    // }

    return children; // Token valid and role allowed
  } catch (err) {
    // Token invalid or expired
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;