import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';


const LoadingPage = () => {
  return (
    <div style={styles.pageContainer}>
      <Container className="d-flex justify-content-center align-items-center" style={styles.container}>
        <Row>
          <Col className="text-center">
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
            <h4>Loading...</h4>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const styles = {
  pageContainer: {
      backgroundColor: '#716b97',  // Lighter Yellow background
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    textAlign: 'center',
  },
  logo: {
    width: '150px', // Adjust this according to your logo size
    marginBottom: '20px',
  }
};

export default LoadingPage;
