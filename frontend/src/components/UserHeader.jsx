import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaSignOutAlt,
  FaUsers,
  FaClipboardList // Order list icon
} from "react-icons/fa";
import { Button, Modal, Table } from "react-bootstrap";
import api from "../api";
import { MdDashboard } from "react-icons/md";


export default function UserHeader() {

  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationCount = notifications.length;
  const [cartCount, setCartCount] = useState(0);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart/user/item", authHeader);
      setCartCount(res.data.itemCount);
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  // Fetch notifications when modal opens
  const handleOpenModal = async () => {
    try {
      const res = await api.get("/notifications", authHeader);
      console.log(res.data)
      setNotifications(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      {/* <nav
        className="navbar navbar-expand-lg px-4"
        style={{
          background: "background: linear-gradient(10deg, #f6ffbe, #fca9a9);",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      > */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#716b97" }}>      

        {/* Brand Logo */}
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

        {/* Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">

            {/* Dashboard */}
            <li className="nav-item mx-2">
              <button className="btn btn-secondary btn-lg d-flex align-items-center gap-1" onClick={() => navigate("/userdashboard")}>
                <MdDashboard color="#dddbdb" size={30} /> Dashboard
              </button>
            </li>

            {/* Cart */}
            <li className="nav-item mx-2">
              <button className="btn btn-warning btn-lg d-flex align-items-center gap-1 position-relative" onClick={() => navigate("/cart")}>
                <FaShoppingCart color="#f8fafc" size={30} /> Cart
                {cartCount > 0 && (
                  <span className="badge bg-danger ms-1">{cartCount}</span>
                )}
              </button>
            </li>

            {/* Orders */}
            <li className="nav-item mx-2">
              <button className="btn btn-success btn-lg d-flex align-items-center gap-1" onClick={() => navigate("/orders")}>
                <FaClipboardList color="#f8fafc" size={30} /> Orders
              </button>
            </li>

            {/* Notifications */}
            <li className="nav-item mx-2">
              <button
                className="btn btn-danger btn-lg d-flex align-items-center gap-1 position-relative"
                onClick={handleOpenModal}
              >
                <FaUsers color="#f8fafc" size={30} /> Notifications
                {notificationCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>
            </li>

            {/* Logout */}
            <li className="nav-item mx-2">
              <Button className="btn btn-info btn-lg" onClick={handleLogout}>
                <FaSignOutAlt className="me-1" /> Logout
              </Button>
            </li>
          </ul>
        </div>
      </nav>
      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length === 0 ? (
            <p>No notifications found</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Product</th>

                  <th>Message</th>



                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id}>
                    <td>{notif.category_name || "-"}</td>
                    <td>{notif.product_name || "-"}</td>


                    <td>{notif.message}</td>



                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
