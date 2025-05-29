// client/src/pages/CreditCardsPage.jsx
import React, { useState } from 'react';
import AddCreditCardForm from '../components/AddCreditCardForm';
import ViewCreditCards from '../components/ViewCreditCards';
import CreditCardDetailModal from '../components/CreditCardDetailModal'; // YENİ IMPORT
import { useNavigate } from 'react-router-dom';

const CreditCardsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false); // Modalın görünürlük durumu
  const [selectedCardId, setSelectedCardId] = useState(null); // Seçilen kartın ID'si
  const navigate = useNavigate();

  const handleCardAction = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Bir karta tıklandığında modalı aç
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setShowDetailModal(true);
  };

  // Modalı kapat
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedCardId(null); // Seçili kart ID'sini sıfırla
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Kredi Kartlarım</h2>

      <div style={styles.buttonContainer}>
        <button onClick={() => navigate('/finans')} style={styles.backButton}>
          &larr; Geri Dön (Finansal Enstrümanlar)
        </button>
      </div>

      {/* Kredi Kartı Ekleme Bölümü */}
      <div style={styles.section}>
        <AddCreditCardForm onCardAdded={handleCardAction} />
      </div>

      {/* Tüm Kredi Kartlarını Görüntüleme ve Yönetme Bölümü */}
      <div style={styles.section}>
        <ViewCreditCards
          onCardDeleted={handleCardAction}
          refreshTrigger={refreshTrigger}
          onCardClick={handleCardClick} // onCardClick prop'u eklendi
        />
      </div>

      {/* Kredi Kartı Detay Modalını Koşullu Olarak Render Et */}
      {showDetailModal && selectedCardId && (
        <CreditCardDetailModal
          cardId={selectedCardId}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  pageTitle: {
    fontSize: '32px',
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
  },
  buttonContainer: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  section: {
    marginBottom: '30px',
  }
};

export default CreditCardsPage;