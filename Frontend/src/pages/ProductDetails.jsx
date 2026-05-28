import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import "./ProductDetails.css";
import UserHeader from "../components/UserHeader";
import { TiShoppingCart } from "react-icons/ti";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartId, setCartId] = useState(null);

  const token = localStorage.getItem("token");

  // ---------------- FETCH PRODUCT + REVIEWS ----------------
  const fetchData = async () => {
    try {
      if (!token) {
        setError("You must be logged in");
        return;
      }

      const [productRes, reviewRes] = await Promise.all([
        api.get(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/reviews/product/${id}`),
      ]);

      setProduct(productRes.data);

      const reviewList = reviewRes.data.reviews || reviewRes.data;
      setReviews(reviewList);

    } catch (err) {
      console.error(err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // ---------------- ADD REVIEW ----------------
  const submitReview = async () => {
    try {
      await api.post(
        "/reviews/add",
        {
          product_id: id,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Review submitted!");

      setRating(0);
      setComment("");

      fetchData(); // refresh reviews

    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit review");
    }
  };

  // ---------------- ADD TO CART ----------------
  const handleAddToCart = async (productId) => {
    try {
      setCartLoading(true);

      if (!token) {
        alert("Login required");
        return;
      }

      const authHeader = {
        headers: { Authorization: `Bearer ${token}` },
      };

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

      alert("✅ Product added to cart!");

    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setCartLoading(false);
    }
  };

  // ---------------- UI ----------------
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <UserHeader />

      <div className="container mt-5">

        <button
          className="btn btn-outline-secondary mb-4"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        {/* PRODUCT CARD */}
        <div className="d-flex justify-content-center">
          <div className="card shadow" style={{ maxWidth: "500px", width: "100%" }}>
            <img
              src={`http://localhost:5002${product.image_url}`}
              className="card-img-top"
              alt={product.name}
              style={{ height: "300px", objectFit: "cover" }}
            />

            <div className="card-body text-center">
              <h4>{product.name}</h4>
              <h5 className="text-success">₹{product.price}</h5>

              {/* ⭐ AVG RATING */}
              <div className="rating mb-2">
                {[1,2,3,4,5].map((star) => (
                  <span
                    key={star}
                    style={{
                      color:
                        star <= Math.round(product.avg_rating || 0)
                          ? "#f59e0b"
                          : "#ccc",
                    }}
                  >
                    ★
                  </span>
                ))}
                <span> ({reviews.length} reviews)</span>
              </div>

              <p><strong>Category:</strong> {product.category_name}</p>
              <p>{product.description}</p>

              <button
                className="btn btn-primary w-100"
                onClick={() => handleAddToCart(product.id)}
                disabled={cartLoading}
              >
                {cartLoading ? "Adding..." : <>
                  <TiShoppingCart /> Add to Cart
                </>}
              </button>
            </div>
          </div>
        </div>

        {/* 📝 ADD REVIEW */}
        <div className="mt-5">
          <h5>Write a Review</h5>

          {[1,2,3,4,5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                fontSize: "25px",
                cursor: "pointer",
                color: star <= rating ? "#f59e0b" : "#ccc",
              }}
            >
              ★
            </span>
          ))}

          <textarea
            className="form-control mt-2"
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button className="btn btn-success mt-2" onClick={submitReview}>
            Submit Review
          </button>
        </div>

        {/* 📄 REVIEW LIST */}
        <div className="mt-4">
          <h5>Customer Reviews</h5>

          {reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border p-2 mb-2">
                <strong>{r.full_name}</strong>

                <div>
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>

                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};

export default ProductDetails;