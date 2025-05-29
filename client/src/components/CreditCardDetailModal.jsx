// client/src/components/CreditCardDetailModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreditCardDetailModal = ({ cardId, onClose }) => {
  const { token } = useAuth();
  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // availableLimit'i burada tanımlamayın. render kısmında veya useEffect içinde cardDetails dolu olduğunda hesaplayın.

  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!token || !cardId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/creditcards/${cardId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // LÜTFEN BURAYI BACKEND'İNİZİN DÖNÜŞ YAPISINA GÖRE AYARLAYIN!
        // Eğer backend "/api/creditcards/:id" için { creditCard: { ... } } döndürüyorsa:
        setCardDetails(response.data.creditCard); // Çoğu zaman bu doğru olan
        // Eğer backend "/api/creditcards/:id" için { ... } (direkt kart objesi) döndürüyorsa:
        // setCardDetails(response.data); // Bu durumda bu satırı kullanın, yukarıdakini yorum satırı yapın.


        setLoading(false);
      } catch (err) {
        console.error('Kredi kartı detayları çekilirken hata:', err);
        setError('Kredi kartı detayları yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [cardId, token]); // cardId veya token değiştiğinde tekrar çek

  if (loading) {
    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modalContent}>
          <p>Kart detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modalContent}>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={onClose} style={modalStyles.closeButton}>Kapat</button>
        </div>
      </div>
    );
  }

  if (!cardDetails) {
    return null; // Detaylar gelmediyse bir şey gösterme
  }

  // cardDetails objesi artık mevcut ve dolu olduğu için burada hesaplayabiliriz
  // NaN hatasını önlemek için Number() ile zorla sayıya çeviriyoruz
  const availableLimit = Number(cardDetails.creditLimit) - Number(cardDetails.currentDebt);


  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modalContent}>
        <button onClick={onClose} style={modalStyles.closeButton}>X</button>
        <h3 style={modalStyles.title}>{cardDetails.name} Detayları</h3>
        <p><strong>Kart Tipi:</strong> {cardDetails.type || 'Belirtilmemiş'}</p>
        <p><strong>Son 4 Hane:</strong> {cardDetails.cardNumberLast4 || 'Yok'}</p>
        {/* Sayı formatlama için ?.toLocaleString kullanmaya devam */}
        <p><strong>Kredi Limiti:</strong> {cardDetails.creditLimit?.toLocaleString('tr-TR')} TL</p>
        <p><strong>Güncel Borç:</strong> {cardDetails.currentDebt?.toLocaleString('tr-TR')} TL</p>
        {/* Hesapladığımız availableLimit'i kullanıyoruz, boşsa veya NaN ise 'Belirtilmemiş' göster */}
        <p>
            <strong>Kullanılabilir Limit:</strong>{' '}
            {
                isNaN(availableLimit) ? 'Belirtilmemiş' : availableLimit.toLocaleString('tr-TR')
            }{' '}TL
        </p>
        {/* Tarih formatlama için önce null/undefined kontrolü */}
        <p><strong>Son Ödeme Tarihi:</strong> {cardDetails.dueDate ? new Date(cardDetails.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
        <p><strong>Oluşturulma Tarihi:</strong> {cardDetails.createdAt ? new Date(cardDetails.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
        <p><strong>Son Güncelleme Tarihi:</strong> {cardDetails.updatedAt ? new Date(cardDetails.updatedAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>

        {/* Buraya kart hareketleri, hesap özeti, taksitler vb. eklenecek */}
        <h4 style={modalStyles.sectionTitle}>Kart Hareketleri (Yakında)</h4>
        <p>Bu kısma ilgili kredi kartının işlem geçmişi ve detayları eklenecektir.</p>

      </div>
    </div>
  );
};

const modalStyles = {
  // ... (Stiller aynı kalabilir)
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#34495e',
    marginTop: '25px',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
};

export default CreditCardDetailModal;