import { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";
import "./Products.css";
import Sidebar from "../components/Sidebar";
import { Button, Table, Form } from "react-bootstrap";
import { DeliveryAgentIcon } from "../components/icons";


export default function CreateDeliveryProfile() {
    const [form, setForm] = useState({
        user_id: "",
        vehicle_type: "",
        vehicle_number: ""
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const[delivery,setDelivery]=useState([])


    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const token = localStorage.getItem("token");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

     // Fetch categories
  const fetchDelivers = async () => {
    try {
      const res = await api.get("/delivery", authHeader);
      console.log("delivery",res)
      setDelivery(res.data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchDelivers();
  }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/delivery-user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(res)
            setUsers(res.data);
        } catch (err) {
            setError("Failed to load users");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await api.post(
                "/delivery",
                form,
                authHeader
            );

            setMessage("Delivery profile created successfully!");
            console.log(res.data);
        } catch (err) {
            setMessage(
                err.response?.data?.error || "Failed to create delivery profile"
            );
        }
    };

    return (
        <div className="admin-container">
            <Sidebar/>
             <div className="admin-content">
                 <h2><DeliveryAgentIcon/>Become a Delivery Partner</h2>
                 <Form onSubmit={handleSubmit} className="mb-4">
  
  {/* Delivery User Select */}
  <Form.Group className="mb-2">
    <Form.Label>Select Delivery User</Form.Label>
    <Form.Select
      name="user_id"
      value={form.user_id}
      onChange={handleChange}
      required
    >
      <option value="">Select Delivery User</option>

      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.full_name}
        </option>
      ))}
    </Form.Select>
  </Form.Group>

  {/* Vehicle Type */}
  <Form.Group className="mb-2">
  <Form.Label>Vehicle Type</Form.Label>
  <Form.Select
    name="vehicle_type"
    value={form.vehicle_type}
    onChange={handleChange}
    required
  >
    <option value="">Select Vehicle Type</option>
    <option value="bike">Bike</option>
    <option value="scooter">Scooter</option>
    <option value="cycle">Cycle</option>
    <option value="car">Car</option>
  </Form.Select>
</Form.Group>

  {/* Vehicle Number */}
  <Form.Group className="mb-3">
    <Form.Label>Vehicle Number</Form.Label>
    <Form.Control
      type="text"
      name="vehicle_number"
      placeholder="Enter vehicle number"
      value={form.vehicle_number}
      onChange={handleChange}
      required
    />
  </Form.Group>

  <Button type="submit" variant="primary">
    Create Profile
  </Button>

</Form>
  {/* Categories Table */}
      <Table striped bordered hover>
  <thead>
    <tr>
      <th># ID</th>
      <th>Name</th>
      <th>Phone</th>
      <th>Vehicle Type</th>
      <th>Vehicle Number</th>
      <th>Status</th>
      <th>Available</th>
      <th width="200px">Actions</th>
    </tr>
  </thead>

  <tbody>
    {delivery.map((item) => (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.full_name}</td>
        <td>{item.phone}</td>
        <td>{item.vehicle_type}</td>
        <td>{item.vehicle_number}</td>
        <td>{item.current_status}</td>
        <td>
          {item.is_available ? "Yes" : "No"}
        </td>

        <td>
          <Button
            variant="warning"
            size="sm"
            className="me-2"
            // onClick={() => handleEdit(item)}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            // onClick={() => handleDelete(item.id)}
          >
            Delete
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
             </div>
           

           

            {message && <p>{message}</p>}
        </div>
    );
}