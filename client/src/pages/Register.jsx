// client/src/pages/Register.jsx
import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için

const Register = () => {
  const navigate = useNavigate(); // Yönlendirme hook'u

  // Yup ile form doğrulama şeması
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Geçerli bir e-posta adresi girin.')
      .required('E-posta adresi zorunludur.'),
    password: Yup.string()
      .min(6, 'Şifre en az 6 karakter olmalıdır.')
      .required('Şifre zorunludur.'),
  });

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', values);
      console.log('Kayıt Başarılı:', response.data);
      alert(response.data.message); // Kullanıcıya başarı mesajı göster
      navigate('/login'); // Kayıt başarılı ise login sayfasına yönlendir
    } catch (error) {
      console.error('Kayıt Hatası:', error.response ? error.response.data : error.message);
      setErrors({ api: error.response ? error.response.data.message : 'Kayıt sırasında bir hata oluştu.' });
      alert(error.response ? error.response.data.message : 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false); // Formu tekrar gönderilebilir yap
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Kayıt Ol</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>E-posta:</label>
                <Field type="email" name="email" style={styles.input} />
                <ErrorMessage name="email" component="div" style={styles.error} />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Şifre:</label>
                <Field type="password" name="password" style={styles.input} />
                <ErrorMessage name="password" component="div" style={styles.error} />
              </div>

              {errors.api && <div style={styles.apiError}>{errors.api}</div>}

              <button type="submit" disabled={isSubmitting} style={styles.button}>
                {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </Form>
          )}
        </Formik>
        <p style={styles.loginLink}>
          Zaten bir hesabın var mı? <a href="/login" style={styles.link}>Giriş Yap</a>
        </p>
      </div>
    </div>
  );
};

// Basit inline stil tanımları
const styles = {
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
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '5px',
  },
  apiError: {
    color: '#dc3545',
    fontSize: '15px',
    marginBottom: '15px',
    border: '1px solid #dc3545',
    padding: '10px',
    borderRadius: '4px',
    backgroundColor: '#f8d7da',
  },
  loginLink: {
    marginTop: '25px',
    fontSize: '16px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default Register;