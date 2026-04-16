import { useLocation } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import { Button, Form, Card, Alert } from "react-bootstrap";
import UserHeader from "../components/UserHeader";

export default function PaymentPage() {
  const location = useLocation();
  const { order, totalAmount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [promoCode, setPromoCode] = useState("WELCOME10"); // ✅ DEFAULT PROMO

  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState(null);

  const [discountInfo, setDiscountInfo] = useState(null);

  // extra fields
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("SBI");

  if (!order) return <h3 className="text-center mt-5">No order selected</h3>;

  // ------------------------
  // PAY NOW
  // ------------------------
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post(
        "/payments/create",
        {
          order_id: order.id,
          payment_method: paymentMethod,
          promo_code: promoCode || "WELCOME10",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setDiscountInfo(res.data); // ✅ backend response (discount + final amount)
      setPaymentCompleted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // DOWNLOAD SLIP
  // ------------------------
  const handleDownloadSlip = async () => {
    try {
      const response = await api.get(`/payment-slip/${order.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PaymentSlip_Order_${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download slip");
    }
  };

  return (
    <>
      <UserHeader />

      <div className="container mt-4">
        <h2 className="text-center mb-4">💳 Payment</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card className="p-4 shadow-sm">

          <p><b>Order ID:</b> {order.id}</p>
          <p><b>Total Amount:</b> ₹{totalAmount}</p>

          {/* DISCOUNT INFO */}
          {discountInfo && (
            <Alert variant="success">
              🎉 Discount Applied: ₹{discountInfo.discount} <br />
              💰 Final Amount: ₹{discountInfo.finalAmount}
            </Alert>
          )}

          {/* PROMO CODE */}
          {!paymentCompleted && (
            <Form.Group className="mb-3">
              <Form.Label>Promo Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="WELCOME10"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </Form.Group>
          )}

          {!paymentCompleted ? (
            <>
              {/* PAYMENT METHOD */}
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Cash on Delivery</option>
                  <option>Credit Card</option>
                  <option>UPI</option>
                  <option>Net Banking</option>
                </Form.Select>
              </Form.Group>

              {/* CREDIT CARD */}
              {paymentMethod === "Credit Card" && (
                <>
                  <Form.Control
                    placeholder="Card Number"
                    className="mb-2"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <Form.Control
                    placeholder="CVV"
                    className="mb-2"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                  <Form.Control
                    type="month"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </>
              )}

              {/* UPI */}
              {paymentMethod === "UPI" && (
                <Form.Control
                  placeholder="UPI ID"
                  className="mb-2"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              )}

              {/* NET BANKING */}
              {paymentMethod === "Net Banking" && (
                <Form.Select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option>SBI</option>
                  <option>HDFC</option>
                  <option>ICICI</option>
                  <option>Axis Bank</option>
                </Form.Select>
              )}

              {/* PAY BUTTON */}
              <Button
                className="w-100 mt-3"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay Now"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-success fw-bold mt-3">
                Payment Successful 🎉
              </p>

              <Button onClick={handleDownloadSlip} className="w-100">
                Download Slip
              </Button>
            </>
          )}
        </Card>
      </div>
    </>
  );
}