// client/src/components/AddCreditCardForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddCreditCardForm = ({ onCardAdded }) => {
  const { token } = useAuth();
  const [newCard, setNewCard] = useState({
    name: '',
    cardNumberLast4: '',
    creditLimit: '',
    dueDate: '',
    type: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

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
      if (onCardAdded) {
        onCardAdded(); // Ana bileşene kartın eklendiğini bildir
      }
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
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px',
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
};

export default AddCreditCardForm;