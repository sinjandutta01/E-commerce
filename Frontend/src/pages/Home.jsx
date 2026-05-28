import React, { useEffect, useState } from "react";
import api from "../api";
import { Spinner, Carousel } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [season, setSeason] = useState("");
  const [heroGradient, setHeroGradient] = useState("");
  const [productBg, setProductBg] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ================= FETCH PRODUCTS WITH RATING =================
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const productList = res.data;

      const updated = await Promise.all(
        productList.map(async (p) => {
          try {
            const r = await api.get(`/reviews/product/${p.id}`);
            const reviews = r.data.reviews || r.data;

            let avg = 0;
            let count = 0;

            if (reviews.length > 0) {
              avg =
                reviews.reduce((s, x) => s + x.rating, 0) /
                reviews.length;

              count = reviews.length;
            }

            return {
              ...p,
              avg_rating: avg,
              review_count: count,
            };
          } catch {
            return { ...p, avg_rating: 0, review_count: 0 };
          }
        })
      );

      setProducts(updated);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= SEASON =================
  useEffect(() => {
    const month = new Date().getMonth();

    if (month >= 2 && month <= 4) setSeason("Spring");
    else if (month >= 5 && month <= 7) setSeason("Summer");
    else if (month >= 8 && month <= 10) setSeason("Autumn");
    else setSeason("Winter");
  }, []);

  // ================= ADD TO CART =================
  const handleAddToCart = (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    console.log("Add to cart:", id);
  };

  return (
    <div>
      <Header />

      {/* HERO (simple Flipkart style strip) */}
      {/* <div className="hero-strip">
        🔥 {season} Deals - Best Offers Today
      </div> */}

      {/* BANNER */}
      {/* <Carousel>
        <Carousel.Item>
          <img className="d-block w-100 banner-img" src="/images/banner1.jpg" />
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100 banner-img" src="/images/banner2.jpg" />
        </Carousel.Item>
      </Carousel> */}

      {/* PRODUCTS */}
      <div className="container my-4">
        <h4 className="mb-3 fw-bold">Top Products</h4>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="row g-3">

            {products.map((p) => (
              <div key={p.id} className="col-6 col-md-3">

                {/* CARD */}
                <div className="flip-card">

                  <img
                    src={
                      p.image_url
                        ? `http://localhost:5002${p.image_url}`
                        : "/no-image.png"
                    }
                    className="product-img"
                    alt={p.name}
                  />

                  <div className="p-2">

                    {/* NAME */}
                    <div className="product-name">
                      {p.name}
                    </div>

                    {/* RATING */}
                    <div className="rating">
                      {"★".repeat(Math.round(p.avg_rating || 0))}
                      {"☆".repeat(5 - Math.round(p.avg_rating || 0))}
                      <span className="count">
                        ({p.review_count || 0})
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="price">
                      ₹{p.price}
                    </div>

                    {/* BUTTON */}
                    <button
                      className="btn-cart"
                      onClick={() => handleAddToCart(p.id)}
                    >
                      Add to Cart
                    </button>

                  </div>
                </div>

              </div>
            ))}

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;