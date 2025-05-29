// client/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={styles.layoutContainer}>
      {/* Outlet, iç içe geçmiş (nested) rotaların içeriğini render eder */}
      <Outlet />
    </div>
  );
};

const styles = {
  layoutContainer: {
    flexGrow: 1, // App.jsx'teki flex yapısına uyum sağlar
    padding: '20px', // Sayfa içeriğine genel boşluk
    minHeight: 'calc(100vh - 60px)', // Navbar yüksekliği kadar boşluk bırak
    backgroundColor: '#f0f2f5', // Hafif bir arka plan rengi
  }
};

export default Layout;