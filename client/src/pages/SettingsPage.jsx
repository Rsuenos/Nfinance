// client/src/pages/SettingsPage.jsx
import React from 'react';

const SettingsPage = () => {
  return (
    <div style={settingsStyles.container}>
      <h2 style={settingsStyles.heading}>Ayarlar</h2>
      <p style={settingsStyles.text}>Uygulama ayarlarını buradan yönetebilirsin.</p>
      {/* Buraya tema ayarları, bildirim ayarları vb. eklenebilir */}
    </div>
  );
};

const settingsStyles = {
  container: {
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '20px auto',
    textAlign: 'center',
  },
  heading: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '28px',
  },
  text: {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.6',
  }
};

export default SettingsPage;