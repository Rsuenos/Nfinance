// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { token, logout, setUser } = useAuth(); // setUser'ı da AuthContext'ten alıyoruz
  const navigate = useNavigate();
  const [initialProfileValues, setInitialProfileValues] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Profil bilgilerini çekme
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = response.data.user;
        setInitialProfileValues({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
          phoneNumber: user.phoneNumber || '',
        });
      } catch (err) {
        console.error('Profil bilgileri çekilirken hata oluştu:', err);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      navigate('/login'); // Token yoksa login sayfasına yönlendir
    }
  }, [token, logout, navigate]);

  // Form doğrulama şeması
  const validationSchema = Yup.object({
    firstName: Yup.string().max(50, 'Ad en fazla 50 karakter olabilir.').optional(),
    lastName: Yup.string().max(50, 'Soyad en fazla 50 karakter olabilir.').optional(),
    dateOfBirth: Yup.date().nullable(true).optional('Geçersiz tarih formatı.'),
    phoneNumber: Yup.string()
      .matches(/^\+?\d{10,15}$/, 'Geçerli bir telefon numarası girin.') // Uluslararası format veya 10-15 hane
      .nullable(true).optional(),
  });

  // Form submit handler
  const onSubmit = async (values, { setSubmitting }) => {
    setMessage(null);
    setError(null);
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
      // AuthContext'teki kullanıcı bilgisini güncelle
      setUser(prevUser => ({
        ...prevUser,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        dateOfBirth: response.data.user.dateOfBirth,
        phoneNumber: response.data.user.phoneNumber,
      }));
      // Formu sıfırlama, eğer gerekirse
      // setInitialProfileValues(values);
    } catch (err) {
      console.error('Profil güncelleme hatası:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Profil güncellenirken bir hata oluştu.');
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={styles.loadingMessage}>Profil yükleniyor...</p>;
  }

  return (
    <div style={styles.profileContainer}>
      <h2 style={styles.profileTitle}>Profil Bilgileriniz</h2>
      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <Formik
        initialValues={initialProfileValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true} // initialValues değiştiğinde formu yeniden yükle
      >
        {({ isSubmitting }) => (
          <Form style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="firstName" style={styles.label}>Ad:</label>
              <Field type="text" name="firstName" style={styles.input} />
              <ErrorMessage name="firstName" component="div" style={styles.errorText} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="lastName" style={styles.label}>Soyad:</label>
              <Field type="text" name="lastName" style={styles.input} />
              <ErrorMessage name="lastName" component="div" style={styles.errorText} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="dateOfBirth" style={styles.label}>Doğum Tarihi:</label>
              <Field type="date" name="dateOfBirth" style={styles.input} />
              <ErrorMessage name="dateOfBirth" component="div" style={styles.errorText} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="phoneNumber" style={styles.label}>Telefon Numarası:</label>
              <Field type="text" name="phoneNumber" style={styles.input} placeholder="+905xxxxxxxxx" />
              <ErrorMessage name="phoneNumber" component="div" style={styles.errorText} />
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.button}>
              {isSubmitting ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const styles = {
  profileContainer: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
  profileTitle: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
    fontSize: '28px',
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
  buttonHover: {
    backgroundColor: '#0056b3',
  },
};

export default Profile;