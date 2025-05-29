// client/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={homeStyles.container}>
      <div style={homeStyles.card}>
        <h1 style={homeStyles.title}>NFinance</h1>
        <p style={homeStyles.description}>
          Finansal işlemlerinizi kolayca yönetin. Gelirlerinizi ve giderlerinizi takip edin, bütçenizi kontrol altına alın.
        </p>
        <div style={homeStyles.buttons}>
          <Link to="/register" style={homeStyles.button}>Kayıt Ol</Link>
          <Link to="/login" style={{ ...homeStyles.button, backgroundColor: '#6c757d' }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

// Home bileşeni için basit inline stil tanımları
const homeStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '10px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '36px',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  description: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  buttons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  button: {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#218838',
  },
};

export default Home;