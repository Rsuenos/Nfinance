// client/src/components/CreditCardList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Token almak için

const CreditCardList = () => {
  const { token } = useAuth();
  const [creditCards, setCreditCards] = useState([]);
  const [newCard, setNewCard] = useState({
    name: '',
    cardNumberLast4: '',
    creditLimit: '',
    dueDate: '',
    type: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Kredi kartlarını API'den çekme
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

  // Bileşen yüklendiğinde kartları çek
  useEffect(() => {
    if (token) {
      fetchCreditCards();
    }
  }, [token]);

  // Form alanları değiştikçe state'i güncelle
  const handleChange = (e) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

  // Yeni kredi kartı ekleme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/creditcards', newCard, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(response.data.message);
      setNewCard({ // Formu sıfırla
        name: '',
        cardNumberLast4: '',
        creditLimit: '',
        dueDate: '',
        type: ''
      });
      fetchCreditCards(); // Listeyi güncelle
    } catch (err) {
      console.error('Kredi kartı ekleme hatası:', err);
      setError(err.response?.data?.message || 'Kredi kartı eklenirken bir hata oluştu.');
    }
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.subTitle}>Yeni Kredi Kartı Ekle</h4>
      {message && <p style={styles.successMessage}>{message}</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Kart Adı (örn: Garanti Bonus)"
          value={newCard.name}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="cardNumberLast4"
          placeholder="Kart Numarasının Son 4 Hanesi"
          value={newCard.cardNumberLast4}
          onChange={handleChange}
          style={styles.input}
          maxLength="4"
        />
        <input
          type="number"
          name="creditLimit"
          placeholder="Kredi Limiti (örn: 10000)"
          value={newCard.creditLimit}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="date"
          name="dueDate"
          placeholder="Son Ödeme Tarihi"
          value={newCard.dueDate}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="type"
          placeholder="Kart Tipi (örn: Visa, MasterCard)"
          value={newCard.type}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Kartı Ekle</button>
      </form>

      <h4 style={styles.subTitle}>Mevcut Kredi Kartlarınız</h4>
      {creditCards.length === 0 ? (
        <p style={styles.noCardsMessage}>Henüz eklenmiş kredi kartınız bulunmamaktadır.</p>
      ) : (
        <ul style={styles.cardList}>
          {creditCards.map((card) => (
            <li key={card.id} style={styles.cardItem}>
              <p style={styles.cardName}>{card.name} ({card.type})</p>
              <p>Limit: {card.creditLimit} TL</p>
              <p>Borç: {card.currentDebt} TL</p>
              <p>Kullanılabilir Limit: {card.availableLimit} TL</p>
              <p>Son Ödeme Tarihi: {new Date(card.dueDate).toLocaleDateString('tr-TR')}</p>
              {card.cardNumberLast4 && <p>Son 4 Hane: {card.cardNumberLast4}</p>}
              {/* Detay, Düzenle, Sil butonları buraya eklenebilir */}
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: { // Henüz kullanılmıyor, ileride CSS ile eklenebilir
    backgroundColor: '#218838',
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
  },
  cardName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: '5px',
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

export default CreditCardList;