// client/src/components/ViewCreditCards.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // AuthContext yolunu kontrol et

const ViewCreditCards = ({ onCardDeleted, refreshTrigger, onCardClick }) => { // onCardClick eklendi
  const { token } = useAuth();
  const [creditCards, setCreditCards] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCreditCards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/creditcards', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCreditCards(response.data.creditCards);
    } catch (err) {
      console.error('Kredi kartlarını çekerken hata:', err);
      setError('Kredi kartları yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchCreditCards();
    }
  }, [token, refreshTrigger]);

  const deleteCreditCard = async (cardId, e) => { // e parametresi eklendi
    e.stopPropagation(); // Olayın kart öğesine yayılmasını engeller
    if (window.confirm('Bu kredi kartını silmek istediğinizden emin misiniz?')) {
      setMessage('');
      setError('');
      try {
        const response = await axios.delete(`http://localhost:5000/api/creditcards/${cardId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessage(response.data.message);
        if (onCardDeleted) {
          onCardDeleted();
        }
        fetchCreditCards();
      } catch (err) {
        console.error('Kredi kartı silme hatası:', err);
        setError(err.response?.data?.message || 'Kredi kartı silinirken bir hata oluştu.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.subTitle}>Mevcut Kredi Kartlarınız</h4>
      {message && <p style={styles.successMessage}>{message}</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
      {creditCards.length === 0 ? (
        <p style={styles.noCardsMessage}>Henüz eklenmiş kredi kartınız bulunmamaktadır.</p>
      ) : (
        <ul style={styles.cardList}>
          {creditCards.map((card) => (
            <li
              key={card.id}
              style={styles.cardItem}
              onClick={() => onCardClick(card.id)} // Kart öğesine tıklandığında
            >
              <p style={styles.cardName}>{card.name} ({card.type})</p>
              <p>Limit: {card.creditLimit} TL</p>
              <p>Borç: {card.currentDebt} TL</p>
              <p>Kullanılabilir Limit: {card.availableLimit} TL</p>
              <p>Son Ödeme Tarihi: {new Date(card.dueDate).toLocaleDateString('tr-TR')}</p>
              {card.cardNumberLast4 && <p>Son 4 Hane: {card.cardNumberLast4}</p>}
              <div style={styles.cardActions}>
                <button
                  onClick={(e) => deleteCreditCard(card.id, e)} // e parametresi eklendi
                  style={styles.deleteButton}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  subTitle: {
    fontSize: '22px',
    color: '#34495e',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  successMessage: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  cardList: {
    listStyle: 'none',
    padding: 0,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    borderLeft: '5px solid #007bff',
    position: 'relative',
    cursor: 'pointer', // Tıklanabilir olduğunu belirtir
    transition: 'transform 0.2s ease-in-out', // Hover efekti için
  },
  cardItemHover: { // Hover efekti için yeni stil (inline style'da direkt kullanılamaz, CSS ile)
    transform: 'translateY(-3px)',
  },
  cardName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: '5px',
  },
  cardActions: {
    marginTop: '15px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  },
  noCardsMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    padding: '20px',
    backgroundColor: '#e9ecef',
    borderRadius: '8px',
  }
};

export default ViewCreditCards;