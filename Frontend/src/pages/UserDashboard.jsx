import { useEffect, useState } from "react";
import * as FaIcons from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import UserHeader from "../components/UserHeader";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import { TiShoppingCart } from "react-icons/ti";


// Category Icons
const categoryIcons = {
  Electronics: FaIcons.FaTv,
  Fashion: FaIcons.FaTshirt,
  Appliances: FaIcons.FaBlender,
  Furniture: FaIcons.FaCouch,
  "Sports & Games": FaIcons.FaFootballBall,
  Default: FaIcons.FaStar,
};

// Product Card
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

export default function UserDashboard() {
  const [categories, setCategories] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.id;


  const phone = decoded?.phone;
  const fullName = decoded?.full_name;

  // chunk recommendedProducts into arrays of 2
  const chunkSize = 5;
  const slides = [];
  for (let i = 0; i < recommendedProducts.length; i += chunkSize) {
    slides.push(recommendedProducts.slice(i, i + chunkSize));
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

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

  // Fetch recommended products
  const fetchRecommendedProducts = async () => {
    try {
      // if (!userId) return;
      // console.log("Fetching recommendations for user ID:", userId);
      const res = await api.get('/products', authHeader);
      console.log("Recommended products response:", res.data);
      setRecommendedProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch recommended products:", err);
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
    if (userId) {
      fetchOrCreateCart();
      fetchRecommendedProducts();
    }
  }, []);

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
        { cart_id: currentCartId, product_id: productId, quantity: 1 },
        authHeader
      );
      alert("Product added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setCartLoading(false);
    }
  };

  const displayedProducts = selectedCategory
    ? categories.find((cat) => cat.id === selectedCategory)?.products || []
    : categories.flatMap((cat) => cat.products);

  return (
    <>
      <UserHeader />
      <div className="dashboard-container">
        <div className="left-panel">
          {decoded ? (
            <div className="user-info text-center">
              <img src={decoded.avatar || "/images/avater.svg"} alt={decoded.full_name || "User Avatar"} className="user-avatar" />
              <h5 className="user-name">{fullName}</h5>
              <p className="user-phone">{phone || "No phone number"}</p>
            </div>
          ) : (
            <p>Loading user info...</p>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="category-list">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.name] || categoryIcons.Default;
                const isSelected = selectedCategory === cat.id;
                return (
                  <li key={cat.id} className={`category-item ${isSelected ? "selected" : ""}`} onClick={() => setSelectedCategory(isSelected ? null : cat.id)}>
                    <Icon size={24} />
                    <span>{cat.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="right-panel">
          {/* Recommended Products */}

          

          <h2>All Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : displayedProducts.length === 0 ? (
            <p>No products available.</p>
          ) : (
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} handleAddToCart={handleAddToCart} cartLoading={cartLoading} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}