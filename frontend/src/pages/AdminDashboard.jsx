import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaDollarSign,
} from "react-icons/fa";

import { Bar, Line } from "react-chartjs-2";
import "./AdminDashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Products per Category",
        data: [],
        backgroundColor: "#3b82f6",
      },
    ],
  });

  useEffect(() => {
    const fetchRevenue = async () => {
      const token = localStorage.getItem("token");

      try {
        const [monthRes, yearRes] = await Promise.all([
          api.get("/revenue/monthly", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/revenue/yearly", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log("Monthly Revenue:", monthRes.data);
        console.log("Yearly Revenue:", yearRes.data);
        setMonthlyRevenue(monthRes.data);
        setYearlyRevenue(yearRes.data);
      } catch (err) {
        console.error("Revenue Error:", err);
      }
    };

    fetchRevenue();
  }, []);
  const monthlyChartData = {
    labels: monthlyRevenue.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Revenue ₹",
        data: monthlyRevenue.map((item) => Number(item.revenue)),

        backgroundColor: "#1e293b",   // dark bar
        borderColor: "#3b82f6",       // blue border
        borderWidth: 1,
      },
    ],
  };

  const yearlyChartData = {
    labels: yearlyRevenue.map((item) => item.year),
    datasets: [
      {
        label: "Yearly Revenue ₹",
        data: yearlyRevenue.map((item) => Number(item.revenue)),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.4,
      },
    ],
  };

  // const lineData = {
  //   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  //   datasets: [
  //     {
  //       label: "Revenue ₹",
  //       data: [5000, 10000, 7500, 12000, 9000, 15000],
  //       borderColor: "#ef4444",
  //       backgroundColor: "rgba(239,68,68,0.2)",
  //       tension: 0.4,
  //     },
  //   ],
  // };

  // ---------------- FETCH STATS ----------------
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      try {
        const [usersRes, ordersRes, productsRes, revenueRes] =
          await Promise.all([
            api.get("/customers", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/orders-total", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/total", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/revenue", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setStats({
          totalUsers: usersRes.data.totalCustomers,
          totalOrders: ordersRes.data.totalOrders,
          totalProducts: productsRes.data.totalProducts,
          totalRevenue: revenueRes.data.totalRevenue,
        });
      } catch (err) {
        console.error("Stats Error:", err.response?.data || err.message);
      }
    };

    fetchStats();
  }, []);

  // ---------------- FETCH CHART DATA ----------------
  useEffect(() => {
    const fetchChart = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await api.get("/products-per-category", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const labels = res.data.map((item) => item.category);
        const data = res.data.map((item) => Number(item.total));

        setChartData({
          labels,
          datasets: [
            {
              label: "Products per Category",
              data,
              backgroundColor: [
                "#3b82f6", // blue
                "#ef4444", // red
                "#10b981", // green
                "#f59e0b", // yellow
                "#8b5cf6", // purple
                "#ec4899", // pink
              ],
            },
          ],
        });
      } catch (err) {
        console.error("Chart Error:", err.response?.data || err.message);
      }
    };

    fetchChart();
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-content">
        <h2 className="dashboard-title">Dashboard</h2>

        {/* ---------------- CARDS ---------------- */}
        <div className="card-grid">
          <div className="card">
            <FaUsers className="icon blue" />
            <h4>Users</h4>
            <p>{stats.totalUsers}</p>
          </div>

          <div className="card">
            <FaShoppingCart className="icon green" />
            <h4>Orders</h4>
            <p>{stats.totalOrders}</p>
          </div>

          <div className="card">
            <FaBox className="icon yellow" />
            <h4>Products</h4>
            <p>{stats.totalProducts}</p>
          </div>

          <div className="card">
            <FaDollarSign className="icon red" />
            <h4>Revenue</h4>
            <p>₹{stats.totalRevenue}</p>
          </div>
        </div>

        {/* ---------------- CHARTS ---------------- */}
        <div className="chart-grid">
          <div className="chart-box">
            <h5>Products per Category</h5>
            <Bar data={chartData} />
          </div>




          {/* Monthly Revenue */}
          <div className="chart-box">
            <h5>Monthly Revenue Overview</h5>
            <Line data={monthlyChartData} />
          </div>

          {/* Yearly Revenue */}
          <div className="chart-box">
            <h5>Yearly Revenue Overview</h5>
            <Line data={yearlyChartData} />
          </div>

        </div>
      </div>
    </div>

  );
}