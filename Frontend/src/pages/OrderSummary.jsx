import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Button } from "react-bootstrap";
import UserHeader from "../components/UserHeader";

export default function OrderSummary() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Fetch order
        const orderRes = await api.get(`/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const orderData = orderRes.data;

        // Fetch delivery address
        let address = null;
        if (orderData.address_id) {
          const addrRes = await api.get(`/address/${orderData.address_id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          address = addrRes.data;
        }

        setOrder({ ...orderData, address });

        // Fetch order items
        const itemsRes = await api.get(`/order-items/order/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItems(itemsRes.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        alert("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading)
    return <h3 className="text-center mt-5">Loading order...</h3>;
  if (!order)
    return <h3 className="text-center mt-5">Order not found</h3>;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0
  );

  const handlePayment = () => {
    navigate("/payment", { state: { order, items, totalAmount } });
  };

  return (
    <>
      <UserHeader />

      <div className="container mt-4">
        <h2 className="mb-4 text-center fw-bold" style={{ color: "#3b3b98" }}>
          📝 Order Summary
        </h2>

        {/* Order Details Card */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: "15px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #ff9ff3, #feca57)",
              height: "10px",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          />
          <div className="card-body">
            <h5 className="fw-bold">Order ID: {order.id}</h5>
            <p>Status: <span className="text-success">{order.status}</span></p>
            <p>Placed On: {new Date(order.created_at).toLocaleString()}</p>

            {order.address && (
              <div className="mt-3 p-3 bg-light rounded shadow-sm">
                <h6 className="fw-bold">Delivery Address:</h6>
                <p className="mb-0">{order.address.address_line1}</p>
                {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p>{order.address.country}</p>
                <p>Phone: {order.address.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <h4 className="mb-3 fw-bold" style={{ color: "#eb2f06" }}>Items:</h4>
        <div className="row g-4 mb-4">
          {items.map(item => (
            <div className="col-12 col-md-6 col-lg-4" key={item.id}>
              <div
                className="card h-100 shadow-sm"
                style={{
                  borderRadius: "12px",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
                }}
              >
                {/* <img
                  src={item.image_url}
                  alt={item.name}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                /> */}
                <div className="card-body d-flex flex-column justify-content-between">
                  <h6 className="fw-bold">{item.name}</h6>
                  <p>Price: ₹{item.price_at_purchase}</p>
                  <p>Qty: {item.quantity}</p>
                  <strong>Total: ₹{item.price_at_purchase * item.quantity}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total and Payment Button */}
        <div className="text-center mb-5">
          <h3 className="fw-bold mb-3">Total Amount: ₹{totalAmount}</h3>
          <Button
            variant="success"
            size="lg"
            onClick={handlePayment}
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </>
  );
}
