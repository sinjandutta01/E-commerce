import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch user saved addresses
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/address/user", authHeader);
      setAddresses(res.data);
    };
    load();
  }, []);

  // Create Order
  const placeOrder = async () => {
    try {
      const res = await api.post(
        "/orders/create",
        {
          address_id: selectedAddress
        },
        authHeader
      );

      const orderId = res.data.id;
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error("Create Order Error:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Select Delivery Address</h2>

      {addresses.map((addr) => (
        <div key={addr.id} className="form-check my-2">
          <input
            className="form-check-input"
            type="radio"
            name="address"
            value={addr.id}
            onChange={() => setSelectedAddress(addr.id)}
          />
          <label className="form-check-label">
            {addr.full_name}, {addr.street}, {addr.city}
          </label>
        </div>
      ))}

      <button
        disabled={!selectedAddress}
        onClick={placeOrder}
        className="btn btn-success mt-3"
      >
        Place Order
      </button>
    </div>
  );
}
