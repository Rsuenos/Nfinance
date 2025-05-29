// client/src/pages/AddTransactionPage.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AddTransactionPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const preselectedCardId = queryParams.get('cardId');

  // Banka hesapları ve kredi kartlarını çekme fonksiyonu
  // BU FONKSİYON useEffect'in DIŞINA TAŞINDI.
  const fetchAccountsAndCards = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true); // Yükleme durumunu başlat
      const bankResponse = await axios.get('http://localhost:5000/api/bankaccounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBankAccounts(bankResponse.data.bankAccounts);

      const cardResponse = await axios.get('http://localhost:5000/api/creditcards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreditCards(cardResponse.data.creditCards); //

    } catch (err) {
      console.error('Hesaplar ve kartlar çekilirken hata:', err);
      setError('Hesaplar ve kartlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false); // Yükleme durumunu bitir
    }
  };

  // Komponent yüklendiğinde ve token değiştiğinde hesapları çekmek için useEffect
  useEffect(() => {
    fetchAccountsAndCards(); //
  }, [token, navigate]);


  // İşlem Tipi Seçenekleri
  const transactionTypeOptions = [
    { label: 'Gelir', value: 'income' },
    { label: 'Harcama', value: 'expense' },
    { label: 'Transfer', value: 'transfer' },
  ];

  // Harcama Kategorileri (Genişletilebilir)
  const expenseCategories = [
    'Gıda', 'Ulaşım', 'Fatura', 'Eğlence', 'Sağlık', 'Eğitim', 'Giyim', 'Ev Giderleri',
    'Yemek', 'Abonelikler', 'Borç Ödemesi', 'Diğer Harcamalar'
  ];

  // Gelir Kategorileri (Genişletilebilir)
  const incomeCategories = [
    'Maaş', 'Kira Geliri', 'Yatırım Getirisi', 'Hediye', 'Faiz', 'Diğer Gelirler'
  ];

  // Transfer Türleri (Sadece 'transfer' işlemi seçildiğinde gösterilir)
  const transferCategories = [
    { label: 'Banka Hesabından Banka Hesabına', value: 'bank_to_bank' },
    { label: 'Banka Hesabından Kredi Kartına (Borç Ödeme)', value: 'bank_to_credit_card' },
  ];

  // Form doğrulama şeması
  const validationSchema = Yup.object().shape({
    transactionType: Yup.string().required('İşlem Tipi Seçimi Zorunludur.'),
    amount: Yup.number()
      .min(0.01, 'Tutar 0\'dan büyük olmalıdır.')
      .required('Tutar zorunludur.')
      .typeError('Geçerli bir sayı giriniz.'),
    transactionDate: Yup.date().required('Tarih zorunludur.').typeError('Geçerli bir tarih giriniz.'),
    description: Yup.string().max(255, 'Açıklama en fazla 255 karakter olabilir.').optional(),

    // GELİR İÇİN DOĞRULAMALAR
    destinationAccountId: Yup.string().when('transactionType', {
      is: 'income',
      then: (schema) => schema.required('Hedef Hesap Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }).when('transactionType', {
      is: 'transfer',
      then: (schema) => schema.required('Hedef Hesap Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }),
    incomeCategory: Yup.string().when('transactionType', {
      is: 'income',
      then: (schema) => schema.required('Gelir Kategorisi Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // HARCAMA İÇİN DOĞRULAMALAR
    sourceAccountId: Yup.string().when('transactionType', {
      is: 'expense',
      then: (schema) => schema.required('Kaynak Hesap/Kart Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }).when('transactionType', {
      is: 'transfer',
      then: (schema) => schema.required('Kaynak Hesap/Kart Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }),
    expenseCategory: Yup.string().when('transactionType', {
      is: 'expense',
      then: (schema) => schema.required('Harcama Kategorisi Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // TRANSFER İÇİN DOĞRULAMALAR
    transferType: Yup.string().when('transactionType', {
      is: 'transfer',
      then: (schema) => schema.required('Transfer Türü Zorunludur.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Form submit handler
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setMessage(null);
    setError(null);

    // Transfer ise kaynak ve hedef aynı olamaz kontrolü
    if (values.transactionType === 'transfer' && values.sourceAccountId === values.destinationAccountId) {
        setError('Kaynak ve hedef hesap/kart aynı olamaz.');
        setSubmitting(false);
        return;
    }

    try {
      let payload = {
        type: values.transactionType,
        amount: values.amount,
        date: values.transactionDate,
        description: values.description,
        userId: token, // AuthContext'ten gelen token/user id
      };

      // Kaynak hesap/kart tipini bulmak için
      const getAccountType = (accountId, accounts, cards) => {
        if (accounts.some(acc => acc.id === accountId)) return 'BankAccount';
        if (cards.some(card => card.id === accountId)) return 'CreditCard';
        return null; // Tip bulunamadı
      };


      if (values.transactionType === 'income') {
        payload.destinationAccountId = values.destinationAccountId;
        payload.destinationAccountType = getAccountType(values.destinationAccountId, bankAccounts, creditCards);
        payload.category = values.incomeCategory;
      } else if (values.transactionType === 'expense') {
        payload.sourceAccountId = values.sourceAccountId;
        payload.sourceAccountType = getAccountType(values.sourceAccountId, bankAccounts, creditCards);
        payload.category = values.expenseCategory;
      } else if (values.transactionType === 'transfer') {
        payload.sourceAccountId = values.sourceAccountId;
        payload.destinationAccountId = values.destinationAccountId;
        payload.transferType = values.transferType;
        payload.category = 'Transfer';
        if (values.transferType === 'bank_to_credit_card') {
            payload.category = 'Kredi Kartı Borç Ödemesi';
        }
        payload.sourceAccountType = getAccountType(values.sourceAccountId, bankAccounts, creditCards);
        payload.destinationAccountType = getAccountType(values.destinationAccountId, bankAccounts, creditCards);
      }

      const response = await axios.post('http://localhost:5000/api/transactions', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(response.data.message || 'İşlem başarıyla eklendi.');
      resetForm();
      // ÖNEMLİ DÜZELTME: İşlem başarıyla eklendikten sonra hesapları ve kartları yeniden çek!
      await fetchAccountsAndCards(); // Bu, listenin güncellenmesini sağlar.

    } catch (err) {
      console.error('İşlem ekleme hatası:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'İşlem eklenirken bir hata oluştu.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={styles.loadingMessage}>Hesaplar ve kartlar yükleniyor...</p>;
  }

  const initialValues = {
    transactionType: preselectedCardId ? 'expense' : '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    sourceAccountId: preselectedCardId || '',
    destinationAccountId: '',
    expenseCategory: '',
    incomeCategory: '',
    transferType: '',
  };


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Yeni İşlem Ekle</h2>
      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting, setFieldValue, setFieldTouched }) => (
          <Form style={styles.form}>
            {/* İşlem Tipi Seçimi */}
            <div style={styles.formGroup}>
              <label htmlFor="transactionType" style={styles.label}>İşlem Tipi:</label>
              <Field
                as="select"
                name="transactionType"
                style={styles.select}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  setFieldValue('transactionType', selectedType);
                  setFieldValue('sourceAccountId', '');
                  setFieldValue('destinationAccountId', '');
                  setFieldValue('expenseCategory', '');
                  setFieldValue('incomeCategory', '');
                  setFieldValue('transferType', '');
                  setFieldTouched('sourceAccountId', false);
                  setFieldTouched('destinationAccountId', false);
                  setFieldTouched('expenseCategory', false);
                  setFieldTouched('incomeCategory', false);
                  setFieldTouched('transferType', false);
                }}
              >
                <option value="">İşlem Tipi Seçin</option>
                {transactionTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Field>
              <ErrorMessage name="transactionType" component="div" style={styles.errorText} />
            </div>

            {/* Tutar */}
            <div style={styles.formGroup}>
              <label htmlFor="amount" style={styles.label}>Tutar (TL):</label>
              <Field type="number" name="amount" step="0.01" style={styles.input} />
              <ErrorMessage name="amount" component="div" style={styles.errorText} />
            </div>

            {/* Tarih */}
            <div style={styles.formGroup}>
              <label htmlFor="transactionDate" style={styles.label}>Tarih:</label>
              <Field type="date" name="transactionDate" style={styles.input} />
              <ErrorMessage name="transactionDate" component="div" style={styles.errorText} />
            </div>

            {/* Açıklama */}
            <div style={styles.formGroup}>
              <label htmlFor="description" style={styles.label}>Açıklama (Opsiyonel):</label>
              <Field as="textarea" name="description" style={styles.textarea} rows="3" />
              <ErrorMessage name="description" component="div" style={styles.errorText} />
            </div>

            {/* DİNAMİK ALANLAR */}

            {/* Harcama ve Transfer için Kaynak Hesap/Kart */}
            {['expense', 'transfer'].includes(values.transactionType) && (
              <div style={styles.formGroup}>
                <label htmlFor="sourceAccountId" style={styles.label}>Kaynak Hesap/Kart:</label>
                <Field as="select" name="sourceAccountId" style={styles.select}>
                  <option value="">Kaynak Seçin</option>
                  {/* Banka Hesaplarım */}
                  {bankAccounts && bankAccounts.length > 0 && (
                    <optgroup label="Banka Hesaplarım">
                      {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name || acc.bankName} - {acc.accountType || ''} ({acc.accountNumberLast4 || ''})</option>
                      ))}
                    </optgroup>
                  )}
                  {(!bankAccounts || bankAccounts.length === 0) && (
                     <option value="" disabled>Banka hesabı yok veya yükleniyor...</option>
                  )}

                  {/* Kredi Kartlarım */}
                  {creditCards && creditCards.length > 0 && (
                    <optgroup label="Kredi Kartlarım">
                      {creditCards.map(card => (
                        <option key={card.id} value={card.id}>{card.name} ({card.cardNumberLast4})</option>
                      ))}
                    </optgroup>
                  )}
                  {(!creditCards || creditCards.length === 0) && (
                    <option value="" disabled>Kredi kartı yok veya yükleniyor...</option>
                  )}
                </Field>
                <ErrorMessage name="sourceAccountId" component="div" style={styles.errorText} />
              </div>
            )}

            {/* Gelir ve Transfer için Hedef Hesap/Kart */}
            {['income', 'transfer'].includes(values.transactionType) && (
              <div style={styles.formGroup}>
                <label htmlFor="destinationAccountId" style={styles.label}>Hedef Hesap/Kart:</label>
                <Field as="select" name="destinationAccountId" style={styles.select}>
                  <option value="">Hedef Seçin</option>
                  {/* Banka Hesaplarım */}
                  {bankAccounts && bankAccounts.length > 0 && (
                    <optgroup label="Banka Hesaplarım">
                      {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name || acc.bankName} - {acc.accountType || ''} ({acc.accountNumberLast4 || ''})</option>
                      ))}
                    </optgroup>
                  )}
                  {(!bankAccounts || bankAccounts.length === 0) && (
                     <option value="" disabled>Banka hesabı yok veya yükleniyor...</option>
                  )}

                  {/* Kredi Kartına ödeme olarak transfer yapılıyorsa hedef olarak kredi kartı seçilebilir */}
                  {values.transactionType === 'transfer' && (
                    <>
                      {creditCards && creditCards.length > 0 && (
                        <optgroup label="Kredi Kartlarım">
                          {creditCards.map(card => (
                            <option key={card.id} value={card.id}>{card.name} ({card.cardNumberLast4})</option>
                          ))}
                        </optgroup>
                      )}
                      {(!creditCards || creditCards.length === 0) && (
                        <option value="" disabled>Kredi kartı yok veya yükleniyor...</option>
                      )}
                    </>
                  )}
                </Field>
                <ErrorMessage name="destinationAccountId" component="div" style={styles.errorText} />
              </div>
            )}

            {/* Harcama Kategorisi */}
            {values.transactionType === 'expense' && (
              <div style={styles.formGroup}>
                <label htmlFor="expenseCategory" style={styles.label}>Kategori:</label>
                <Field as="select" name="expenseCategory" style={styles.select}>
                  <option value="">Kategori Seçin</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Field>
                <ErrorMessage name="expenseCategory" component="div" style={styles.errorText} />
              </div>
            )}

            {/* Gelir Kategorisi */}
            {values.transactionType === 'income' && (
              <div style={styles.formGroup}>
                <label htmlFor="incomeCategory" style={styles.label}>Kategori:</label>
                <Field as="select" name="incomeCategory" style={styles.select}>
                  <option value="">Kategori Seçin</option>
                  {incomeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Field>
                <ErrorMessage name="incomeCategory" component="div" style={styles.errorText} />
              </div>
            )}

            {/* Transfer Tipi (Transfer seçildiyse) */}
            {values.transactionType === 'transfer' && (
              <div style={styles.formGroup}>
                <label htmlFor="transferType" style={styles.label}>Transfer Türü:</label>
                <Field as="select" name="transferType" style={styles.select}>
                  <option value="">Transfer Türü Seçin</option>
                  {transferCategories.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="transferType" component="div" style={styles.errorText} />
                {/* Kaynak ve hedef aynı uyarısı */}
                {values.sourceAccountId && values.destinationAccountId && values.sourceAccountId === values.destinationAccountId && (
                    <div style={styles.errorText}>Kaynak ve hedef hesap/kart aynı olamaz.</div>
                )}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} style={styles.button}>
              {isSubmitting ? 'İşlem Ekleniyor...' : 'İşlemi Ekle'}
            </button>
          </Form>
        )}
      </Formik>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          &larr; Dashboard'a Geri Dön
        </button>
      </div>

      {/* Mevcut Kredi Kartları Listesi */}
      <h3 style={{ ...styles.title, marginTop: '40px' }}>Mevcut Kredi Kartlarınız</h3>
      {creditCards.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>Henüz eklenmiş kredi kartınız bulunmamaktadır.</p>
      ) : (
        <div style={styles.cardListContainer}>
          {creditCards.map(card => {
            // BURADA KULLANILABİLİR LİMİTİ HESAPLIYORUZ
            const availableLimit = Number(card.creditLimit) - Number(card.currentDebt);
            return (
              <div key={card.id} style={styles.cardItem}>
                <h4 style={styles.cardName}>{card.name} ({card.type})</h4>
                <p>Limit: {card.creditLimit?.toLocaleString('tr-TR')} TL</p>
                <p>Borç: {card.currentDebt?.toLocaleString('tr-TR')} TL</p>
                {/* HESAPLANAN availableLimit'i GÖSTERİYORUZ */}
                <p>Kullanılabilir Limit: {availableLimit?.toLocaleString('tr-TR')} TL</p>
                <p>Son Ödeme Tarihi: {new Date(card.dueDate).toLocaleDateString('tr-TR')}</p>
                <p>Son 4 Hane: {card.cardNumberLast4}</p>
                {/* Sil butonu */}
                <button
                  style={styles.deleteButton}
                  onClick={() => {/* Silme işlemi buraya gelecek */ alert('Silme özelliği henüz aktif değil.'); }}
                >
                  Sil
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '700px',
    margin: '20px auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
    fontSize: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
  },
  loadingMessage: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
    marginTop: '50px',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: 'calc(100% - 20px)',
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  textarea: {
    width: 'calc(100% - 20px)',
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '5px',
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
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
  cardListContainer: {
    marginTop: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  cardItem: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e2e6ea',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  cardName: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
  deleteButton: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  },
};

export default AddTransactionPage;