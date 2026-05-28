import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { ReactComponent as Logo } from "../assets/icon.svg";

function Header() {
  const navigate = useNavigate();
  return (
<nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#716b97" }}>      
  <div className="container">

        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src="images/icon.svg" 
            alt="Logo" 
           style={{
    height: "80px",
    marginRight: "10px",
    filter: "invert(2000%)" // makes it white

  }}
          />
         <span
  style={{
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: "22px",
    letterSpacing: "1px",
    fontFamily: "Poppins, sans-serif",
    background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }}
>
  E-Commerce
</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <button
    className="btn btn-primary btn-lg"
    onClick={() => navigate("/login")}
  >
    <FaSignInAlt style={{ marginRight: "5px" }} size={30}/>
    Login
  </button>
            </li>

            <li className="nav-item">
              <button
    className="btn btn-success btn-lg ms-2"
    onClick={() => navigate("/register")}
  >
    <FaUserPlus style={{ marginRight: "5px" }} size={30}/>
    Register
  </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
