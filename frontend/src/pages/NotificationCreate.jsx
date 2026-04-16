import React, { useState, useEffect } from "react";
import api from "../api";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import { use } from "react";
import "./Products.css";

const NotificationCreate = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    product_id: "",
    category_id: "",
    type: "",
    message: "",
    channel: "email",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
   const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };


  // Fetch users, products, categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get("/users",authHeader);
        const productsRes = await api.get("/products",authHeader);
        const categoriesRes = await api.get("/categories",authHeader);
        console.log("Users:", usersRes.data);
        console.log("Products:", productsRes.data);
        console.log("Categories:", categoriesRes.data);

        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!formData.user_id || !formData.type || !formData.message || (!formData.product_id && !formData.category_id)) {
      setError("Please fill required fields and select product or category.");
      return;
    }

    try {
     const res = await api.post("/notifications", formData, authHeader);
      setSuccess("Notification created successfully!");
      setFormData({
        user_id: "",
        product_id: "",
        category_id: "",
        type: "",
        message: "",
        channel: "email",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to create notification.");
    }
  };


  useEffect(() => {
    const fetchNotifications = async () => {
      try { 
        const notificationsRes = await api.get("/notifications", authHeader);
        console.log("Notifications:", notificationsRes.data);
        setNotifications(notificationsRes.data);
      } catch (err) {
        console.error(err);
      } 
    };
    fetchNotifications();
  }, []);

  return (
    
    
    <div className="admin-container">
    <Sidebar/>
    <div className="admin-content">
      <h2>Create Notification</h2>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Label>User</Form.Label>
            <Form.Select name="user_id" value={formData.user_id} onChange={handleChange}>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Category (optional)</Form.Label>
            <Form.Select name="category_id" value={formData.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Label>Product (optional)</Form.Label>
            <Form.Select name="product_id" value={formData.product_id} onChange={handleChange}>
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </Form.Select>
          </Col>
          
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" value={formData.type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="stock">Stock Alert</option>
              <option value="price_drop">Price Drop</option>
              <option value="offer">Offer</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Label>Channel</Form.Label>
            <Form.Select name="channel" value={formData.channel} onChange={handleChange}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Button variant="primary" type="submit">Create Notification</Button>
      </Form>
      <h3 className="mt-5">Notification List</h3>

{notifications.length === 0 ? (
  <p>No notifications found</p>
) : (
  <table className="table table-bordered mt-3">
    <thead>
      <tr>
        <th>User</th>
         <th>Category</th>
        <th>Product</th>
       
        <th>Type</th>
        <th>Message</th>
        <th>Channel</th>
        <th>Created At</th>
        <th>Expires At</th>
        
      </tr>
    </thead>
    <tbody>
      {notifications.map((notif) => (
        <tr key={notif.id}>
          <td>{notif.full_name}</td>
           <td>{notif.category_name}</td>
          <td>{notif.product_name}</td>
         
          <td>{notif.type}</td>
          <td>{notif.message}</td>
          <td>{notif.channel}</td>
          <td>{new Date(notif.created_at).toLocaleString()}</td>
          <td>{notif.expires_at ? new Date(notif.expires_at).toLocaleString() : 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
    </div>
    </div>
  );
};

export default NotificationCreate;