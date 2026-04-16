import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { Table, Alert, Spinner, Button, Form, Modal } from "react-bootstrap";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const token = localStorage.getItem("token");

  // ---------------- FETCH USERS ----------------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- DELETE USER ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchUsers(); // refresh
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    }
  };

  // ---------------- EDIT USER ----------------
  const handleEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/users/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-content">
        <h2>All Users</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.is_verified ? (
                        <span style={{ color: "green" }}>✔</span>
                      ) : (
                        <span style={{ color: "red" }}>✖</span>
                      )}
                    </td>

                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" align="center">
                    No Users Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editUser && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={editUser.full_name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, full_name: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  value={editUser.phone}
                  onChange={(e) =>
                    setEditUser({ ...editUser, phone: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}