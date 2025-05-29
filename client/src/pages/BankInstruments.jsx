// client/src/pages/BankInstruments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BankInstruments = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [latestCreditCards, setLatestCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatestCreditCards = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/creditcards', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLatestCreditCards(response.data.creditCards.slice(0, 2)); // Son 2 kartı al
        setLoading(false);
      } catch (err) {
        console.error('Son kredi kartlarını çekerken hata:', err);
        setError('Kredi kartları yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchLatestCreditCards();
  }, [token]);

  const handleViewAllCreditCards = () => {
    navigate('/creditcards'); // Yeni oluşturduğumuz rotaya yönlendir
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Finansal Enstrümanlarım</h2>

      <div style={styles.overviewCard}>
        <h3 style={styles.sectionTitle}>Genel Bakış</h3>
        <p>Toplam Nakit, Toplam Borç vb. burada gösterilecek.</p>
      </div>

      <div style={styles.cardGrid}>
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Kredi Kartlarım</h3>
          {loading ? (
            <p>Kredi kartları yükleniyor...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : latestCreditCards.length === 0 ? (
            <p>Henüz eklenmiş kredi kartınız bulunmamaktadır.</p>
          ) : (
            <div style={styles.summaryList}>
              {latestCreditCards.map((card) => (
                <div key={card.id} style={styles.summaryItem}>
                  <p style={styles.summaryName}>{card.name}</p>
                  <p>Kullanılabilir Limit: {card.availableLimit?.toLocaleString('tr-TR')} TL</p>
                  <p>Güncel Borç: {card.currentDebt?.toLocaleString('tr-TR')} TL</p>
                  <p>Son Ödeme Tarihi: {new Date(card.dueDate).toLocaleDateString('tr-TR')}</p>
                </div>
              ))}
              {latestCreditCards.length === 2 && <p style={styles.moreCardsText}>...</p>}
            </div>
          )}
          <button
            style={styles.viewAllButton}
            onClick={handleViewAllCreditCards}
          >
            Tüm Kredi Kartlarımı Görüntüle
          </button>
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Banka Hesaplarım</h3>
          <p>Banka hesapları listesi ve ekleme formu buraya gelecek.</p>
          <button style={styles.viewAllButton}>Tüm Banka Hesaplarımı Görüntüle</button>
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Kredilerim</h3>
          <p>Kredi listesi ve ekleme formu buraya gelecek.</p>
          <button style={styles.viewAllButton}>Tüm Kredilerimi Görüntüle</button>
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Yatırımlarım</h3>
          <p>Yatırım listesi ve ekleme formu buraya gelecek.</p>
          <button style={styles.viewAllButton}>Tüm Yatırımlarımı Görüntüle</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '32px',
    color: '#2c3e50',
    marginBottom: '30px',
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#e6f7ff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
    textAlign: 'center',
    border: '1px solid #b3e0ff',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#34495e',
    marginBottom: '20px',
    borderBottom: '1px solid #eceff1',
    paddingBottom: '10px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  summaryList: {
    marginBottom: '15px',
  },
  summaryItem: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
  },
  summaryName: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#2c3e50',
    marginBottom: '5px',
  },
  moreCardsText: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#555',
    marginTop: '10px',
  },
  viewAllButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    alignSelf: 'center',
    transition: 'background-color 0.3s ease',
  },
};

export default BankInstruments;