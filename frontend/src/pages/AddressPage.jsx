import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import UserHeader from "../components/UserHeader";

export default function AddressPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [invalidSession, setInvalidSession] = useState(false);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newAddress, setNewAddress] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
    is_default: false,
  });

  useEffect(() => {
    if (!state || !state.cartId || !state.cartItems) {
      setInvalidSession(true);
    }
  }, [state]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in again.");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        setError("Session expired. Login again.");
        return;
      }
      setUser(decoded);
    } catch {
      setError("Failed to decode token.");
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadAddresses = async () => {
      try {
        const res = await api.get(`/address/user/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAddresses(res.data);
        const def = res.data.find((a) => a.is_default);
        if (def) setSelectedAddressId(def.id);
      } catch {
        setError("Failed to load addresses");
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [user]);

  const addAddress = async () => {
    try {
      await api.post(
        "/address/add",
        { user_id: user.id, ...newAddress },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSuccess("Address added successfully!");
      setNewAddress({
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        phone: "",
        is_default: false,
      });
      const res = await api.get(`/address/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddresses(res.data);
    } catch {
      setError("Failed to add address.");
    }
  };

  const placeOrder = async () => {
    const { cartId, cartItems } = state;
    if (!selectedAddressId) return alert("Please select an address!");

    try {
      const total_amount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderRes = await api.post(
        "/orders/create",
        {
          user_id: user.id,
          address_id: selectedAddressId,
          total_amount,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const orderId = orderRes.data.order.id;

      for (const item of cartItems) {
        await api.post(
          "/order-items/add",
          {
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }

      await api.delete(`/cart-items/clear/${cartId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      navigate(`/order-summary/${orderId}`);
    } catch (err) {
      console.error(err);
      alert("Order failed!");
    }
  };

  if (invalidSession)
    return <h3 className="text-center mt-5">Invalid checkout session</h3>;
  if (loading)
    return <h3 className="text-center mt-5">Loading addresses...</h3>;

  return (
    <>
      <UserHeader />
      <div className="container mt-4">
        <h2 className="mb-4 text-center fw-bold" style={{ color: "#3b3b98" }}>
          📬 Select Delivery Address
        </h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="row g-3">
          {addresses.map((addr) => (
            <div className="col-12 col-md-6" key={addr.id}>
              <Card
                className={`p-3 ${
                  selectedAddressId === addr.id
                    ? "border-success shadow"
                    : "shadow-sm"
                }`}
                onClick={() => setSelectedAddressId(addr.id)}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  borderRadius: "12px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    selectedAddressId === addr.id
                      ? "0 8px 20px rgba(0,0,0,0.25)"
                      : "0 3px 10px rgba(0,0,0,0.1)";
                }}
              >
                <p className="mb-1 fw-bold">{addr.address_line1}</p>
                {addr.address_line2 && <p className="mb-1">{addr.address_line2}</p>}
                <p className="mb-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="mb-1">{addr.country}</p>
                <p className="mb-0">📞 {addr.phone}</p>
              </Card>
            </div>
          ))}
        </div>

        <h4 className="mt-5 mb-3 fw-bold" style={{ color: "#ff6b6b" }}>➕ Add New Address</h4>
        <Form className="row g-2">
          {[
            "address_line1",
            "address_line2",
            "city",
            "state",
            "pincode",
            "country",
            "phone",
          ].map((key) => (
            <Form.Group className="col-12 col-md-6" key={key}>
              <Form.Control
                placeholder={key.replace("_", " ").toUpperCase()}
                value={newAddress?.[key] || ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, [key]: e.target.value })
                }
              />
            </Form.Group>
          ))}

          <Form.Group className="col-12">
            <Form.Check
              type="checkbox"
              label="Set as default"
              checked={newAddress.is_default}
              onChange={(e) =>
                setNewAddress({ ...newAddress, is_default: e.target.checked })
              }
            />
          </Form.Group>

          <div className="col-12 text-center">
            <Button
              variant="primary"
              onClick={addAddress}
              disabled={!newAddress.address_line1 || !newAddress.city}
              className="me-2"
            >
              Add Address
            </Button>

            <Button
              variant="success"
              onClick={placeOrder}
              disabled={!selectedAddressId}
            >
              Place Order
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
