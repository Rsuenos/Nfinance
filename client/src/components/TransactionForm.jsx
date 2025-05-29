// client/src/components/TransactionForm.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TransactionForm = ({ onSubmit, initialValues }) => {
  // Form doğrulama şeması
  const validationSchema = Yup.object({
    type: Yup.string()
      .oneOf(['income', 'expense'], 'Geçersiz işlem tipi')
      .required('İşlem tipi zorunludur.'),
    amount: Yup.number()
      .typeError('Miktar bir sayı olmalıdır.')
      .positive('Miktar pozitif olmalıdır.')
      .required('Miktar zorunludur.'),
    category: Yup.string().optional(),
    description: Yup.string().optional(),
    date: Yup.date().optional(),
  });

  return (
    <div style={styles.formContainer}>
      <Formik
        initialValues={initialValues || { type: 'expense', amount: '', category: '', description: '', date: '' }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          onSubmit(values); // Ana bileşene submit işlemini iletiyoruz
          setSubmitting(false);
          resetForm(); // Formu sıfırla
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form style={styles.form}>
            <h2 style={styles.formTitle}>Yeni İşlem Ekle</h2>

            <div style={styles.formGroup}>
              <label htmlFor="type" style={styles.label}>İşlem Tipi:</label>
              <Field as="select" name="type" style={styles.select}>
                <option value="expense">Gider</option>
                <option value="income">Gelir</option>
              </Field>
              <ErrorMessage name="type" component="div" style={styles.error} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="amount" style={styles.label}>Miktar:</label>
              <Field type="number" name="amount" step="0.01" style={styles.input} />
              <ErrorMessage name="amount" component="div" style={styles.error} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="category" style={styles.label}>Kategori (Opsiyonel):</label>
              <Field type="text" name="category" style={styles.input} />
              <ErrorMessage name="category" component="div" style={styles.error} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="description" style={styles.label}>Açıklama (Opsiyonel):</label>
              <Field as="textarea" name="description" style={styles.textarea} />
              <ErrorMessage name="description" component="div" style={styles.error} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="date" style={styles.label}>Tarih (Opsiyonel):</label>
              <Field type="date" name="date" style={styles.input} />
              <ErrorMessage name="date" component="div" style={styles.error} />
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.button}>
              {isSubmitting ? 'Ekleniyor...' : 'İşlem Ekle'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const styles = {
  formContainer: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    margin: '20px auto', // Merkezi konumlandırma için
  },
  formTitle: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
    fontSize: '24px',
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
    backgroundColor: '#f9f9f9',
    boxSizing: 'border-box',
  },
  textarea: {
    width: 'calc(100% - 20px)',
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#28a745',
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
    backgroundColor: '#218838',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '5px',
  },
};

export default TransactionForm;