import React, { useEffect, useState } from "react";
import api from "../api";
import { Spinner, Carousel } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // ✅ Import CSS

const Home = () => {
    const [season, setSeason] = useState("");
    const [heroGradient, setHeroGradient] = useState("");
    const [productBg, setProductBg] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [offerText, setOfferText] = useState("");
    const [offerIndex, setOfferIndex] = useState(0);

    const navigate = useNavigate();

   const handleAddToCart = (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login to add items 🛒");
        navigate("/login");
        return;
    }

    console.log("Add to cart:", productId);
};

    const offers = [
        "🔥 50% OFF on all items!",
        "🚚 Free Shipping Over ₹999!",
        "🎉 Buy 1 Get 1 Free!",
        "💥 Mega Sale Today!",
    ];

    // ===================== SEASON LOGIC =====================
    useEffect(() => {
        const month = new Date().getMonth();

        if (month >= 2 && month <= 4) {
            setSeason("Spring");
            setHeroGradient("linear-gradient(135deg, #ff9a9e, #fad0c4)");
            setProductBg("linear-gradient(to right, #fff, #fff0f5)");
        } else if (month >= 5 && month <= 7) {
            setSeason("Summer");
            setHeroGradient("linear-gradient(135deg, #f6d365, #fda085)");
            setProductBg("linear-gradient(to right, #fff, #fffacd)");
        } else if (month >= 8 && month <= 10) {
            setSeason("Autumn");
            setHeroGradient("linear-gradient(135deg, #d38312, #a83279)");
            setProductBg("linear-gradient(to right, #fff, #ffe4b5)");
        } else {
            setSeason("Winter");
            setHeroGradient("linear-gradient(135deg, #4facfe, #00f2fe)");
            setProductBg("linear-gradient(to right, #fff, #e0ffff)");
        }
    }, []);

    // ===================== FETCH PRODUCTS =====================
    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error loading products:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ===================== OFFER ROTATION =====================
    useEffect(() => {
        setOfferText(offers[0]);

        const interval = setInterval(() => {
            setOfferIndex((prev) => {
                const next = (prev + 1) % offers.length;
                setOfferText(offers[next]);
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <Header />
            
            {/* 🔥 HERO OFFER BAR */}
            {/* <div
                className="hero-bar d-flex justify-content-center align-items-center"
                style={{ background: heroGradient }}
            >
                <div className="fade-in">{offerText}</div>
            </div> */}

            {/* 🎡 CAROUSEL */}
            {/* <Carousel>
                <Carousel.Item>
                    <img className="d-block w-100 banner-img" src="/images/banner1.jpg" alt="banner" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100 banner-img" src="/images/banner2.jpg" alt="banner" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100 banner-img" src="/images/banner3.jpg" alt="banner" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100 banner-img" src="/images/banner4.jpg" alt="banner" />
                </Carousel.Item>
            </Carousel> */}

            {/* 🛍️ PRODUCT SECTION */}
            <div style={{ background: productBg, padding: "50px 0" }}>
                {/* <h2 className="text-center fw-bold mb-5">
                    ✨ {season} Collection
                </h2> */}

                <div className="container">
                    <div className="row g-4">

                        {/* LOADING */}
                        {loading && (
                            <div className="text-center">
                                <Spinner animation="border" />
                            </div>
                        )}

                        {/* PRODUCTS */}
                        {/* PRODUCTS */}
                        {!loading && products.map((p) => (
                            <div className="col-12 col-sm-6 col-md-3 fade-up" key={p.id}>
                                <div className="product-card">
                                    <span className="badge bg-danger position-absolute m-2">SALE</span>

                                    <div className="image-wrapper">
                                        <img
                                            src={p.image_url ? `http://localhost:5002${p.image_url}` : "/no-image.png"}
                                            alt={p.name}
                                        />
                                    </div>

                                    <div className="card-body text-center">
                                        <h6 className="fw-bold">{p.name}</h6>
                                        <p className="price">₹{p.price}</p>

                                        <button class="add-to-cart"  onClick={() => navigate("/login")}>Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div >
            </div >

            <Footer />
        </div >
    );
};

export default Home;
