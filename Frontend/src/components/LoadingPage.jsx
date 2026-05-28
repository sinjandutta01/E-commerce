import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';
import { NotificationListIcon } from './icons';


const LoadingPage = () => {
  return (
    <div style={styles.pageContainer}>
      <Container className="d-flex justify-content-center align-items-center" style={styles.container}>
        <Row>
          <Col className="text-center">
            {/* <img src="images/logo.png" alt="Logo" style={styles.logo} /> */}
            <NotificationListIcon/>
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
