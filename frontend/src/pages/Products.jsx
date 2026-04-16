import React, { useEffect, useState } from "react";
import api from "../api";
import { Button, Table, Form, Image, Alert } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch products and categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", authHeader);
      setProducts(res.data);
    } catch (err) {
      setError("Error loading products.");
      console.error("Error loading products:", err);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories", authHeader);
      setCategories(res.data);
    } catch (err) {
      setError("Error loading categories.");
      console.error("Error loading categories:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Form validation for enabling the submit button
  const isFormValid = name && price && categoryId;

  // Add or Edit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      if (imageFile) formData.append("image", imageFile);

      if (isEdit) {
        await api.put(`/products/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        setMessage("Product updated successfully");
      } else {
        await api.post("/products/create", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        setMessage("Product added successfully");
      }

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setImageFile(null);
      setIsEdit(false);
      setEditId(null);

      fetchProducts();
    } catch (err) {
      setError("Error saving product.");
      console.error("Error saving product:", err);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setIsEdit(true);
    setEditId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategoryId(product.category_id || "");
    setImageFile(null); // optional new image
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(`/products/${id}`, authHeader);
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      setError("Error deleting product.");
      console.error("Error deleting product:", err);
    }
  };

return (
  <div className="admin-container">

    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="admin-content">

      <h2>Product Management</h2>

      {/* Messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {/* Form */}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-2">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            isInvalid={!name}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            isInvalid={!price}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Category</Form.Label>
          <Form.Control
            as="select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </Form.Group>

        <Button type="submit" disabled={!isFormValid}>
          {isEdit ? "Update Product" : "Add Product"}
        </Button>
      </Form>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Image</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>
                {p.image_url ? (
                  <img
                    src={`http://localhost:5002${p.image_url}`}
                    alt={p.name}
                    width="80"
                  />
                ) : (
                  "No image"
                )}
              </td>
              <td>{p.category_name}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

    </div>
  </div>
);
};

export default Products;
