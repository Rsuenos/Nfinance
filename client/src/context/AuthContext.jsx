// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [user, setUser] = useState(null); // Yeni: Tam kullanıcı objesi için state

  const navigate = useNavigate();

  // Token ve email değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [token, userEmail]);

  // Giriş yapma fonksiyonu
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUserEmail(receivedUser.email);
      setUser(receivedUser); // Kullanıcı objesini state'e kaydet
      navigate('/dashboard');
    } catch (error) {
      console.error('Giriş hatası:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Giriş sırasında bir hata oluştu.');
    }
  }, [navigate]);

  // Çıkış yapma fonksiyonu
  const logout = useCallback(() => {
    setToken(null);
    setUserEmail(null);
    setUser(null); // Çıkış yapıldığında kullanıcı objesini sıfırla
    navigate('/login');
  }, [navigate]);

  // JWT'nin süresini kontrol etme (isteğe bağlı ama iyi bir pratik)
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (decodedToken.exp * 1000 < Date.now()) { // Token süresi geçmişse
            console.warn('Token süresi doldu, otomatik çıkış yapılıyor.');
            logout();
          }
        } catch (e) {
          console.error('Token çözümlenirken hata:', e);
          logout(); // Geçersiz token durumunda çıkış yap
        }
      }
    };

    const interval = setInterval(checkTokenExpiration, 60 * 1000); // Her dakika kontrol et
    checkTokenExpiration(); // İlk yüklemede de kontrol et
    return () => clearInterval(interval);
  }, [token, logout]);

  // Context değeri
  const value = {
    token,
    userEmail,
    user, // user objesini context'e ekle
    login,
    logout,
    setUser, // setUser fonksiyonunu da context'e ekle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};