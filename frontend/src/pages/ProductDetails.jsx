import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import "./ProductDetails.css";
import UserHeader from "../components/UserHeader";
import { TiShoppingCart } from "react-icons/ti";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartId, setCartId] = useState(null); // store current cart

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view products");
          return;
        }

        const res = await api.get(`/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProduct(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle Add to Cart
  const handleAddToCart = async (productId) => {
    try {
      setCartLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add products to cart");
        return;
      }

      const authHeader = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Create cart if not exists
      let currentCartId = cartId;
      if (!currentCartId) {
        const res = await api.post("/cart/create", {}, authHeader);
        currentCartId = res.data.id;
        setCartId(currentCartId);
      }

      // Add item to cart
      await api.post(
        "/cart-items/add",
        {
          cart_id: currentCartId,
          product_id: productId,
          quantity: 1,
        },
        authHeader
      );

      alert("✅ Product added to cart!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <UserHeader />

      <div className="container mt-5">

        {/* Back Button */}
        <button
          className="btn btn-outline-secondary mb-4"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div className="d-flex justify-content-center">
          <div
            className="card product-card-hover shadow"
            style={{ maxWidth: "500px", width: "100%" }}
          >
            <img
              src={`http://localhost:5002${product.image_url}`}
              className="card-img-top"
              alt={product.name}
              style={{ height: "300px", objectFit: "cover" }}
            />

            <div className="card-body text-center">
              <h4 className="card-title">{product.name}</h4>
              <h5 className="text-success mb-2">₹{product.price}</h5>
              <p className="text-muted mb-1">
                <strong>Category:</strong> {product.category_name}
              </p>
              <p className="card-text">{product.description}</p>

              <button
                className="btn btn-primary w-100"
                onClick={() => handleAddToCart(product.id)}
                disabled={cartLoading}
              >
                {cartLoading ? (
    "Adding..."
  ) : (
    <>
      <TiShoppingCart style={{ marginRight: "5px" }} />
      Add to Cart
    </>
  )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;