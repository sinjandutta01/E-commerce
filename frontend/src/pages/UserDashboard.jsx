import { useEffect, useState } from "react";
import * as FaIcons from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import UserHeader from "../components/UserHeader";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import { TiShoppingCart } from "react-icons/ti";



// Footer
// const Footer = () => {
//   return (
//     <footer className="flipkart-footer">
//       <div className="footer-top">
//         <div className="footer-column">
//           <h5>ABOUT</h5>
//           <ul>
//             <li>Contact Us</li>
//             <li>About Us</li>
//             <li>Careers</li>
//           </ul>
//         </div>
//         <div className="footer-column">
//           <h5>HELP</h5>
//           <ul>
//             <li>Payments</li>
//             <li>Shipping</li>
//             <li>Cancellation & Returns</li>
//           </ul>
//         </div>
//         <div className="footer-column">
//           <h5>POLICY</h5>
//           <ul>
//             <li>Return Policy</li>
//             <li>Terms of Use</li>
//             <li>Security</li>
//           </ul>
//         </div>
//         <div className="footer-column">
//           <h5>SOCIAL</h5>
//           <ul>
//             <li>Facebook</li>
//             <li>Twitter</li>
//             <li>Instagram</li>
//           </ul>
//         </div>
//       </div>

//       <div className="footer-bottom">
//         © 2026 My E-Commerce. All rights reserved.
//       </div>
//     </footer>
//   );
// };

// Category Icons
const categoryIcons = {
  Electronics: FaIcons.FaTv,
  Fashion: FaIcons.FaTshirt,
  Appliances: FaIcons.FaBlender,
  Furniture: FaIcons.FaCouch,
  "Sports & Games": FaIcons.FaFootballBall,
  Default: FaIcons.FaStar,
};

// Category Colors
const categoryColors = {
  Electronics: "#6EC1E4",
  Fashion: "#F78FB3",
  Appliances: "#A3CB38",
  Furniture: "#E58E26",
  "Sports & Games": "#82589F",
  Default: "#FFB142",
};

// Product Card


const ProductCard = ({ product, handleAddToCart, cartLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="product-card card shadow-sm position-relative">
      {product.discount && (
        <div className="price-badge">{product.discount}% OFF</div>
      )}

      <img
        src={`http://localhost:5002${product.image_url}`}
        alt={product.name}
         style={{ borderRadius: "15px", objectFit: "cover", height: "200px" }}
      />

      <div className="card-body d-flex flex-column text-center">
        <h6 className="card-title">{product.name}</h6>
        <p className="text-success mb-2">₹{product.price}</p>

        <div className="product-actions">
          <button
            className="btn btn-primary btn-sm d-flex align-items-center justify-content-center flex-fill"
            onClick={() => handleAddToCart(product.id)}
            disabled={cartLoading}
          >
            {cartLoading ? (
              "Adding..."
            ) : (
              <>
                <TiShoppingCart style={{ marginRight: "5px", fontSize: "1.5rem" }} />
                Add to Cart
              </>
            )}
          </button>

          <button
            className="btn btn-outline-success btn-sm flex-fill"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const [categories, setCategories] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.id;
  const phone = decoded?.phone;
  const fullName = decoded?.full_name;

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch categories + products
  const fetchCategoriesWithProducts = async () => {
    try {
      const res = await api.get("/with-products", authHeader);

      const grouped = {};
      res.data.forEach((row) => {
        const catId = Number(row.category_id);

        if (!grouped[catId]) {
          grouped[catId] = {
            id: catId,
            name: row.category_name,
            description: row.description,
            products: [],
          };
        }
        if (row.product_id) {
          grouped[catId].products.push({
            id: row.product_id,
            name: row.product_name,
            price: row.price,
            image_url: row.image_url,
          });
        }
      });

      setCategories(Object.values(grouped));
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch or create cart
  const fetchOrCreateCart = async () => {
    try {
      setCartLoading(true);
      const res = await api.get(`/cart/user/${userId}`, authHeader);
      setCartId(res.data.id);
    } catch (err) {
      if (err.response?.status === 404) {
        const createRes = await api.post("/cart/create", {}, authHeader);
        setCartId(createRes.data.id);
      }
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithProducts();
    if (userId) fetchOrCreateCart();
  }, []);

  // Add to cart
  const handleAddToCart = async (productId) => {
    try {
      setCartLoading(true);

      let currentCartId = cartId;

      if (!currentCartId) {
        const res = await api.post("/cart/create", {}, authHeader);
        currentCartId = res.data.id;
        setCartId(currentCartId);
      }

      await api.post(
        "/cart-items/add",
        {
          cart_id: currentCartId,
          product_id: productId,
          quantity: 1,
        },
        authHeader
      );

      alert("Product added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setCartLoading(false);
    }
  };

  // Filter products
  const displayedProducts = selectedCategory
    ? categories.find((cat) => cat.id === selectedCategory)?.products || []
    : categories.flatMap((cat) => cat.products);

  return (
    <>
      <UserHeader />

      <div className="dashboard-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          {/* User Info */}
          {decoded ? (
            <div className="user-info text-center">
              <img
                src={decoded.avatar || "/images/avater.svg"} // use avatar from JWT or default
                alt={decoded.full_name || "User Avatar"}
                className="user-avatar"
              />
              <h5 className="user-name" style={{ color: "#0d0d0e", fontWeight: "bold" }}>
                {fullName}
              </h5>
              <p className="user-phone" style={{ color: "#0d0d0e" }}>
                {phone || "No phone number"}
              </p>
            </div>
          ) : (
            <p>Loading user info...</p>
          )}

          {/* <h4 style={{color:"black"}}>Categories</h4> */}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="category-list">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.name] || categoryIcons.Default;
                const isSelected = selectedCategory === cat.id;

                return (
                  <li
                    key={cat.id}
                    className={`category-item ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      setSelectedCategory(isSelected ? null : cat.id)
                    }
                  >
                    <Icon size={24} /> {/* Increased icon size */}
                    <span style={{color:"black"}}>{cat.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <h1 style={{marginTop:"10px"}}>Products</h1>

          {loading ? (
            <p>Loading products...</p>
          ) : displayedProducts.length === 0 ? (
            <p>No products available.</p>
          ) : (
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                  cartLoading={cartLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* <Footer /> */}
    </>
  );
}
