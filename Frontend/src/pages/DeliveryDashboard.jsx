import { useEffect, useState } from "react";
import api from "../api";
import { Table, Badge, Button, Spinner } from "react-bootstrap";
import "./AdminDashboard.css";
import DeliverySidebar from "../components/DeliverySidebar";
import { DeliveryIcon } from "../components/icons";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const user = JSON.parse(atob(token.split(".")[1]));

  // 🚨 IMPORTANT: real delivery partner id
  const [deliveryId, setDeliveryId] = useState(null);

  // STEP 1: get delivery partner profile
  const fetchProfileAndOrders = async () => {
    try {
      setLoading(true);

      // 1. Get delivery profile
      const profileRes = await api.get(
        `/delivery/${user.id}`,
        authHeader
      );

      const partnerId = profileRes.data.id;
      setDeliveryId(partnerId);

      // 2. Get orders using correct ID
      const orderRes = await api.get(
        `/delivery/orders/${partnerId}`,
        authHeader
      );

      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
    } catch (err) {
      console.error("Error loading data:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndOrders();
  }, []);

  // update order status
  const updateStatus = async (orderId, status) => {
    try {
      await api.put(
        `/orders/${orderId}`,
        { status },
        authHeader
      );

      fetchProfileAndOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <DeliverySidebar />

      <div className="admin-content">
        <h2 className="mb-4">
          <DeliveryIcon />
          Delivery Dashboard
        </h2>

        {orders.length === 0 ? (
          <h5>No orders assigned yet</h5>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user_name}</td>
                  <td>{order.phone}</td>
                  <td>
                    {order.address_line1},{" "}
                    {order.address_line2 || "N/A"},{" "}
                    {order.city},{" "}
                    {order.pincode}
                  </td>
                  <td>₹{order.total_amount}</td>

                  <td>
                    <Badge
                      bg={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "picked"
                          ? "warning"
                          : "info"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>

                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() =>
                        updateStatus(order.id, "picked")
                      }
                      disabled={order.status !== "assigned"}
                    >
                      Picked
                    </Button>

                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        updateStatus(order.id, "delivered")
                      }
                      disabled={order.status === "delivered"}
                    >
                      Delivered
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}