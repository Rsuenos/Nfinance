// client/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext yolunu kontrol et

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // AuthContext'ten kullanıcı ve yüklenme durumunu al

  if (loading) {
    // Yüklenirken veya kimlik doğrulanırken bir şeyler gösterebiliriz
    return <div>Yükleniyor...</div>;
  }

  // Kullanıcı oturum açmışsa çocuk bileşenlerini (veya Outlet'i) render et
  // Aksi takdirde login sayfasına yönlendir
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;