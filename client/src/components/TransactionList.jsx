// client/src/components/TransactionList.jsx
import React from 'react';

const TransactionList = ({ transactions, onDeleteTransaction }) => {
  if (!transactions || transactions.length === 0) {
    return <p style={styles.noTransactions}>Henüz hiçbir işlem eklenmemiş.</p>;
  }

  return (
    <div style={styles.listContainer}>
      <h2 style={styles.listTitle}>İşlemleriniz</h2>
      <ul style={styles.ul}>
        {transactions.map((transaction) => (
          <li key={transaction.id} style={styles.listItem}>
            <div style={styles.transactionInfo}>
              <span style={styles.typeLabel(transaction.type)}>
                {transaction.type === 'income' ? 'Gelir' : 'Gider'}
              </span>
              <span style={styles.amount}>
                {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toFixed(2)}
              </span>
              <span style={styles.category}>{transaction.category || 'Belirtilmemiş'}</span>
              <span style={styles.date}>{new Date(transaction.date).toLocaleDateString()}</span>
              {transaction.description && (
                <p style={styles.description}>{transaction.description}</p>
              )}
            </div>
            <button
              onClick={() => onDeleteTransaction(transaction.id)}
              style={styles.deleteButton}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  listContainer: {
    width: '100%',
    maxWidth: '700px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    margin: '30px auto', // Merkezi konumlandırma için
  },
  listTitle: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
    fontSize: '24px',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#777',
    fontSize: '18px',
    marginTop: '30px',
  },
  ul: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #eee',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  transactionInfo: {
    flexGrow: 1,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto', // type, amount, category/date
    gap: '5px 15px',
    alignItems: 'center',
  },
  typeLabel: (type) => ({
    backgroundColor: type === 'income' ? '#d4edda' : '#f8d7da',
    color: type === 'income' ? '#155724' : '#721c24',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    gridColumn: '1 / 2', // Type'ı ilk sütuna yerleştir
  }),
  amount: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    gridColumn: '2 / 3', // Miktarı ikinci sütuna yerleştir
    textAlign: 'right',
  },
  category: {
    fontSize: '14px',
    color: '#666',
    gridColumn: '1 / 2', // Kategoriyi tipin altına yerleştir
  },
  date: {
    fontSize: '14px',
    color: '#999',
    gridColumn: '3 / 4', // Tarihi en sağa yerleştir
    textAlign: 'right',
  },
  description: {
    fontSize: '14px',
    color: '#888',
    marginTop: '5px',
    gridColumn: '1 / -1', // Açıklamayı tüm genişliğe yay
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
    marginLeft: '20px',
    '&:hover': {
      backgroundColor: '#c82333',
    },
  },
};

export default TransactionList;