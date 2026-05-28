import React from "react";
import api from "../api"; // Axios instance
import { Button } from "react-bootstrap";

export default function DownloadPaymentSlip({ orderId }) {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/payment-slip/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for PDF download
      });

      // Create a URL for the blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `PaymentSlip_Order_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download payment slip:", err);
      alert("Failed to download payment slip");
    }
  };

  return (
    <Button variant="primary" onClick={handleDownload}>
      Download Payment Slip
    </Button>
  );
}
