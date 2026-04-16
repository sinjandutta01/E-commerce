import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from "./pages/AdminDashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Home from "./pages/Home";
import LoadingPage from './components/LoadingPage'; // Import the loading page
import UserDashboard from './pages/UserDashboard';
import CartPage from './pages/CartPage';

import AddressPage from './pages/AddressPage';
import OrderSummary from './pages/OrderSummary';
import PaymentPage from './pages/PaymentPage';
import OrdersList from './pages/OrdersList';
import UserOrders from './pages/UserOrders';
import VerifyOtp from "./pages/VerifyOtp";
import NotificationCreate from './pages/NotificationCreate';
import ProductDetails from './pages/ProductDetails';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component
import Users from './pages/Users';

function App() {
  const [isLoading, setIsLoading] = useState(true); // Initially set loading to true

  useEffect(() => {
    // Simulate a loading period (e.g., fetching data, initializing app)
    const timer = setTimeout(() => {
      setIsLoading(false); // After 3 seconds, stop the loading screen
    }, 3000); // Adjust the timeout as per your needs

    return () => clearTimeout(timer); // Clean up timeout on component unmount
  }, []);

  if (isLoading) {
    return <LoadingPage />; // Show loading page while isLoading is true
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
         <Route path="/admin/create-notifications" element={<ProtectedRoute><NotificationCreate /></ProtectedRoute>} />
        <Route path="/admin/allusers" element={<ProtectedRoute><Users /></ProtectedRoute>} />

        
        
        <Route path="/userdashboard" element={
          <UserDashboard />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout-address" element={<AddressPage />} />
        <Route path="/order-summary/:orderId" element={<OrderSummary />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
