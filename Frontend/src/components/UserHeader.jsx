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


const ProductCard = ({ product, handleAddToCart, cartLoading }) => {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await api.get(`/reviews/product/${product.id}`);
        const reviews = res.data.reviews || res.data;
        if (reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setRating(avg);
          setCount(reviews.length);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchRating();
  }, [product.id]);

  const navigate = useNavigate();

  return (
    <div className="product-card card shadow-sm position-relative">
      <img
        src={`http://localhost:5002${product.image_url}`}
        alt={product.name}
        style={{ borderRadius: "15px", objectFit: "cover", height: "200px" }}
      />
      <div className="card-body text-center d-flex flex-column">
        <h6 className="card-title">{product.name}</h6>

        {/* ⭐ Rating */}
        <div className="rating mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} style={{ color: star <= Math.round(rating) ? "#f59e0b" : "#ccc" }}>
              ★
            </span>
          ))}
          <span className="rating-count">({count})</span>
        </div>

        <div className="price-section mb-2">
          <span className="new-price">₹{product.price}</span>
        </div>

        <div className="product-actions">
          <button
            className="btn btn-primary btn-sm flex-fill"
            onClick={() => handleAddToCart(product.id)}
            disabled={cartLoading}
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
          <button className="btn btn-outline-success btn-sm flex-fill" onClick={() => navigate(`/product/${product.id}`)}>
            View
          </button>
        </div>
      </div>
    </div>
  );
};


export default function UserHeader() {

  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
const [suggestedProducts, setSuggestedProducts] = useState([]);

// chunk products for carousel (similar to UserDashboard)
const chunkSize = 3; // 3 products per slide
const suggestedSlides = [];
for (let i = 0; i < suggestedProducts.length; i += chunkSize) {
  suggestedSlides.push(suggestedProducts.slice(i, i + chunkSize));
}

// Fetch suggested products when button clicked
const handleOpenSuggestedModal = async () => {
  try {
    const res = await api.get("/products", authHeader); // Or your recommendation API
    setSuggestedProducts(res.data || []);
    setShowSuggestedModal(true);
  } catch (err) {
    console.error("Failed to fetch suggested products:", err);
  }
};

const handleCloseSuggestedModal = () => setShowSuggestedModal(false);

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
            {/* Suggested Products */}
<li className="nav-item mx-2">
  <button
    className="btn btn-primary btn-lg d-flex align-items-center gap-1"
    onClick={handleOpenSuggestedModal}
  >
    Suggested Products
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

      {/* Suggested Products Modal */}
<Modal show={showSuggestedModal} onHide={handleCloseSuggestedModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Suggested Products for You</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {suggestedProducts.length === 0 ? (
      <p>No suggested products available</p>
    ) : (
      <div id="suggestedProductsCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          {suggestedSlides.map((group, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <div className="d-flex justify-content-center flex-wrap">
                {group.map((product) => (
                  <div key={product.id} className="mx-2 flex-fill" style={{ maxWidth: "250px" }}>
                    <ProductCard
                      product={product}
                      handleAddToCart={() => {}} // you can pass proper cart handler
                      cartLoading={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#suggestedProductsCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#suggestedProductsCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseSuggestedModal}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
    </>
  );
}
