import { useEffect, useState } from "react";
import api from "../api";
import UserHeader from "../components/UserHeader";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/user", authHeader);
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <UserHeader />

      <div className="container mt-5">
        <h3 className="mb-4 fw-bold text-center">My Orders</h3>

        {loading ? (
          <p className="text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="mb-5">
              <h5>Order ID: #{order.order_id}</h5>
              <p>
                <strong>Status:</strong> {order.order_status} |{" "}
                <strong>Payment Status:</strong> {order.payment_status} |{" "}
                <strong>Payment Method:</strong> {order.payment?.method || order.payment_method || "N/A"} |{" "}
                <strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()} |{" "}
                <strong>Total:</strong> ₹{order.total_amount}
              </p>

              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.product_id}>
                        <td className="d-flex align-items-center gap-2">
                          <img
                            src={`http://localhost:5002${item.image_url}`}
                            alt={item.name}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                          />
                          {item.name}
                        </td>
                        <td>{item.category_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {order.payment && (
                <p>
                  <strong>Payment Details:</strong> Amount: ₹{order.payment.amount}, Status: {order.payment.status}, Transaction ID: {order.payment.transaction_id || "N/A"}
                </p>
              )}

              <p>
                <strong>Shipping Address:</strong> {order.address_line1}, {order.address_line2 && `${order.address_line2},`} {order.city}, {order.state}, {order.pincode}, {order.country}. Phone: {order.phone}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
