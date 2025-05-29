// client/src/components/AppContent.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth hook'unu buradan çağırıyoruz

import Register from '../pages/Register';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import BankInstruments from '../pages/BankInstruments';
import CreditCardsPage from '../pages/CreditCardsPage';
import PrivateRoute from './PrivateRoute'; // Aynı klasörde olduğu için './'
import Navbar from './Navbar'; // Navbar, App.jsx'te render edildiği için burada tekrar import etmiyoruz
import Sidebar from './Sidebar';
import Layout from '././Layout'; // Layout'un varlığından emin olun
import Profile from '../pages/Profile';
import SettingsPage from '../pages/SettingsPage';
import LoansPage from '../pages/LoansPage';
import InvestmentsPage from '../pages/InvestmentsPage';
import AddTransactionPage from '../pages/AddTransactionPage';

function AppContent() {
  // useAuth hook'unu AuthProvider'ın çocuk bileşeni içinde çağırıyoruz
  const { user } = useAuth();

  return (
    <> {/* Bu bileşen doğrudan render edildiği için bir div yerine Fragment kullanabiliriz */}
      {/* Navbar, App.jsx'te render edildiği için burada kaldırıldı */}
      <div style={appStyles.mainContentContainer}>
        {/* Kullanıcı oturum açmışsa Sidebar'ı göster, aksi takdirde gizle */}
        {user && <Sidebar />}
        {/* Route içeriğinin render edileceği ana alan */}
        <main style={appStyles.contentArea}>
          <Routes>
            {/* Public Rotalar (Giriş yapmadan erişilebilen sayfalar) */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Private Rotalar (Giriş yapmayı gerektiren sayfalar) */}
            {/* "/" yolu için PrivateRoute ve Layout'u kullanarak iç içe rotaları tanımlarız */}
            {/* PrivateRoute, kullanıcının oturum açıp açmadığını kontrol eder */}
            {/* Layout, Navbar ve Sidebar ile birlikte sayfa düzenini sağlar */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              {/* Ana Dashboard sayfası, kök yolu için index olarak ayarlandı */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="finans" element={<BankInstruments />} />
              <Route path="creditcards" element={<CreditCardsPage />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="loans" element={<LoansPage />} />
              <Route path="investments" element={<InvestmentsPage />} />
              <Route path="add-transaction" element={<AddTransactionPage />} />
              {/* Diğer özel (private) rotalar buraya eklenecek */}
            </Route>
          </Routes>
        </main>
      </div>
    </>
  );
}

// Genel uygulama düzeni için stil tanımları (App.jsx'ten taşındı)
const appStyles = {
  mainContentContainer: {
    display: 'flex',
    flexDirection: 'row', // Yatay düzen: Sidebar solda, içerik sağda
    minHeight: 'calc(100vh - 60px)', // Navbar'ın yüksekliği (60px) kadar boşluk bırakarak içeriğin Navbar'ın altına gelmesini sağlar
  },
  contentArea: {
    flexGrow: 1, // Kalan tüm alanı kapla
    padding: '20px', // İçerik ile kenarlar arasında boşluk
    backgroundColor: '#f0f2f5', // Hafif bir arka plan rengi
    overflowY: 'auto', // İçerik taştığında kaydırma çubuğu
  },
};

export default AppContent;