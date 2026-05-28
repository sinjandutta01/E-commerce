import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Table, Button, Spinner, Badge,Form } from "react-bootstrap";
import UserHeader from "../components/UserHeader";
import Sidebar from "../components/Sidebar";
import "./Products.css";
import { CartIcon } from "../components/icons";

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };


  useEffect(() => {
  const fetchPartners = async () => {
    try {
      const res = await api.get("/delivery", authHeader);
      setDeliveryPartners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchPartners();
}, []);

const handleAssignDelivery = async (orderId, partnerId) => {
  try {
    await api.post(
      "/assign-order",
      {
        order_id: orderId,
        delivery_partner_id: partnerId,
      },
      authHeader
    );

    alert("Delivery assigned successfully!");

    // refresh orders
    const res = await api.get("/orders", authHeader);
    setOrders(res.data);

  } catch (err) {
    console.error(err);
    alert("Failed to assign delivery");
  }
};

  // Fetch all orders (admin endpoint)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders", authHeader); // admin endpoint
        console.log("Fetched orders:", res.data);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        alert("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

//   const handleDelete = async (orderId) => {
//     if (!window.confirm("Are you sure you want to delete this order?")) return;
//     setUpdating(true);
//     try {
//       await api.delete(`/orders/${orderId}`, authHeader);
//       setOrders(orders.filter((o) => o.id !== orderId));
//       alert("Order deleted successfully!");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Failed to delete order");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleEdit = (orderId) => {
//     navigate(`/admin/orders/edit/${orderId}`);
//   };

//   const handleView = (orderId) => {
//     navigate(`/order-summary/${orderId}`);
//   };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading orders...</p>
      </div>
    );

  if (orders.length === 0)
    return <h3 className="text-center mt-5">No orders found.</h3>;

  return (
     <div className="admin-container">
     <Sidebar/>
        <div className="admin-content">
        <h2 className="mb-4 text-center fw-bold" style={{ color: "#3b3b98" }}>
          <CartIcon /> All Orders (Admin)
        </h2>

        <Table striped bordered hover responsive>
          <thead style={{ background: "#6a89cc", color: "#fff" }}>
            <tr>
              {/* <th>ID</th> */}
              <th>Category</th>
              <th>Product</th>
              <th>Product Quantity</th>
              <th>Product Price(₹)</th>
              <th>Total Amount (₹)</th>
              <th>Placed On</th>
              <th>Status</th>
              <th>Payment</th>
              <th>User Email</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
           <tr
  key={order.id}
  style={{
    opacity: order.status === "assigned" ? 0.5 : 1,
    pointerEvents: order.status === "assigned" ? "none" : "auto",
  }}
>
                {/* <td>{order.id}</td> */}
                <td>{order.category_name || "N/A"}</td>
                <td>{order.product_name || "N/A"}</td>
                <td>{order.quantity || "N/A"}</td>
                <td>₹{order.product_price || "N/A"}</td>
                <td>₹{order.total_amount}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <Badge
                    bg={
                      order.status === "Delivered"
                        ? "success"
                        : order.status === "Pending"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {order.status}
                  </Badge>
                </td> 
                <td>
                  <Badge
                    bg={
                      order.payment_status === "Paid"
                        ? "success"
                        : order.payment_status === "Pending"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {order.payment_status}
                  </Badge>
                </td> 
                <td>{order.user_name || order.user_email}</td>
                <td>{order.phone || "N/A"}</td>
                <td>{order.address_line1 || "N/A"}, {order.address_line2 || "N/A"}, 
                  {order.city || "N/A"},{order.state || "N/A"},{order.pincode || "N/A"}</td>
                  <td>
  <Button size="sm" variant="info" className="me-1 mb-1">
    View
  </Button>

  <Button size="sm" variant="warning" className="me-1 mb-1">
    Edit
  </Button>

  <Button size="sm" variant="danger" className="mb-1">
    Delete
  </Button>

  {/* 👇 NEW DELIVERY BUTTON */}
  <div className="mt-1">
    <Form.Select
      size="sm"
      onChange={(e) =>
        handleAssignDelivery(order.id, e.target.value)
      }
      defaultValue=""
    >
      <option value="">Assign Delivery</option>
      {deliveryPartners.map((p) => (
        <option key={p.id} value={p.id}>
          {p.full_name}
        </option>
      ))}
    </Form.Select>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
