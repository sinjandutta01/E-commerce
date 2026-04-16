import React, { useEffect, useState } from "react";
import api from "../api";
import { Button, Table, Form } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import "./Products.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories", authHeader);
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add or Edit category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/categories/${editId}`, { name, description }, authHeader);
      } else {
        await api.post("/categories/create", { name, description }, authHeader);
      }
      setName("");
      setDescription("");
      setIsEdit(false);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  const handleEdit = (cat) => {
    setIsEdit(true);
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/categories/${id}`, authHeader);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    
    <div className="admin-container">
   <Sidebar/>
    <div className="admin-content">
      <h2>Category Management</h2>

      {/* Inline Form */}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-2">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          {isEdit ? "Update Category" : "Add Category"}
        </Button>
      </Form>

      {/* Categories Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th># ID</th>
            <th>Name</th>
            <th>Description</th>
            <th width="200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.name}</td>
              <td>{cat.description}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(cat)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cat.id)}
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

export default Categories;
