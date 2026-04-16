import { useEffect, useState } from "react";
import api from "../api";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { TiShoppingCart } from "react-icons/ti";
import Sidebar from "../components/Sidebar";

export default function CartPage() {
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch user cart
  const fetchUserCart = async () => {
    try {
      const res = await api.get("/cart/user/item", authHeader);
      setCartId(res.data.cartId);
    } catch (err) {
      console.error("Cart fetch failed:", err);
    }
  };

  // Fetch cart items
  const fetchCartItems = async (cid) => {
    if (!cid) return;
    setLoading(true);
    try {
      const res = await api.get(`/cart-items/${cid}`, authHeader);
      setItems(res.data);
    } catch (err) {
      console.error("Item fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      await api.put(`/cart-items/${id}`, { quantity }, authHeader);
      await fetchCartItems(cartId);
    } catch (err) {
      console.error("Quantity update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Remove one item
  const removeItem = async (id) => {
    setUpdating(true);
    try {
      await api.delete(`/cart-items/${id}`, authHeader);
      await fetchCartItems(cartId);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!cartId) return;
    setUpdating(true);
    try {
      await api.delete(`/cart-items/clear/${cartId}`, authHeader);
      setItems([]);
    } catch (err) {
      console.error("Clear failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Checkout
  const checkout = () => {
    if (items.length === 0) {
      alert("Cart is empty!");
      return;
    }
    navigate("/checkout-address", { state: { cartId, cartItems: items } });
  };

  // Initial fetch
  useEffect(() => {
    fetchUserCart();
  }, []);

  useEffect(() => {
    if (cartId) fetchCartItems(cartId);
  }, [cartId]);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) return <h3 className="text-center mt-5">Loading Cart...</h3>;

  return (
    <>
      <UserHeader />
      
      <div className="container mt-4">
  <h2 className="mb-4 text-center fw-bold" style={{ color: "#3b3b98" }}>
    <TiShoppingCart size={40} className="mb-1" /> Your Shopping Cart
  </h2>

  {items.length === 0 ? (
    <h4 className="text-center text-muted mt-5">Your cart is empty.</h4>
  ) : (
    <div className="row g-4 justify-content-center">
      {items.map((item) => (
        <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={item.id}>
          <div
            className="card h-100 shadow-sm hover-scale"
            style={{
              borderRadius: "15px",
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="card-img-top"
              style={{ height: "220px", objectFit: "cover" }}
            />
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title fw-bold">{item.name}</h5>
                <p className="text-success fw-semibold">₹{item.price}</p>

                <div className="d-flex align-items-center gap-2 mt-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={updating || item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={updating}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <strong>Total: ₹{item.price * item.quantity}</strong>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={updating}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {items.length > 0 && (
    <div className="mt-5 text-center">
      <h3 className="fw-bold" style={{ color: "#eb2f06" }}>
        Total Amount: ₹{totalPrice}
      </h3>
      <div className="mt-3 d-flex justify-content-center gap-3 flex-wrap">
        <Button
          variant="outline-danger"
          size="lg"
          onClick={clearCart}
          disabled={updating}
        >
          Clear Cart
        </Button>
        <Button
          variant="success"
          size="lg"
          onClick={checkout}
          disabled={updating}
        >
          Checkout
        </Button>
      </div>
    </div>
  )}

  {/* Optional Hover Effect */}
  <style>
    {`
      .hover-scale:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.12);
      }
    `}
  </style>
</div>
    </>
  );
}
