// client/src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // useNavigate hook'unu import ettik

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // useNavigate hook'unu kullanıma alıyoruz

  // "Yeni İşlem Ekle" butonuna tıklandığında çalışacak fonksiyon
  const handleAddTransaction = () => {
    navigate('/add-transaction'); // Yeni işlem ekleme sayfasına yönlendir
  };

  return (
    <div style={styles.dashboardContainer}>
      <h2 style={styles.welcomeTitle}>
        Hoş Geldin, {user ? user.username : 'Misafir'}!
      </h2>

      <div style={styles.summarySection}>
        <h3 style={styles.sectionTitle}>Genel Durum Özeti</h3>
        <p>Burada toplam gelir, toplam gider, net bakiye gibi özet bilgiler yer alacak.</p>
        {/* Daha fazla özet bilgisi eklenebilir */}
      </div>

      <div style={styles.actionSection}>
        <h3 style={styles.sectionTitle}>Hızlı İşlemler</h3>
        <button
          onClick={handleAddTransaction}
          style={styles.addTransactionButton}
        >
          Yeni İşlem Ekle
        </button>
        {/* Diğer hızlı işlem butonları buraya eklenebilir */}
      </div>

      <div style={styles.recentActivitySection}>
        <h3 style={styles.sectionTitle}>Son Hareketler</h3>
        <p>En son gelir ve gider hareketleri burada listelenecek.</p>
        {/* Son hareketlerin listesi buraya gelecek */}
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    padding: '30px',
    maxWidth: '900px',
    margin: '20px auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  welcomeTitle: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '32px',
  },
  summarySection: {
    backgroundColor: '#e6f7ff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    marginBottom: '30px',
    borderLeft: '5px solid #007bff',
  },
  actionSection: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  recentActivitySection: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    borderLeft: '5px solid #28a745',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#34495e',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  addTransactionButton: {
    backgroundColor: '#007bff', // Mavi buton
    color: 'white',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
    '&:hover': { // Hover efekti (inline style'da direkt çalışmaz, CSS veya styled-components ile)
      backgroundColor: '#0056b3',
      transform: 'translateY(-2px)',
    },
  },
};

export default Dashboard;