// client/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  // Profil dropdown'ının dışına tıklandığında kapanmasını sağlar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setShowProfileDropdown(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navbar'ın profil ve linkler dışındaki herhangi bir yerine tıklayınca ana sayfaya yönlendirme
  const handleNavbarClick = (e) => {
    if (profileRef.current && profileRef.current.contains(e.target)) {
      return;
    }
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    // Sadece logo veya sağdaki profil kısmı dışındaki tıklamalarda Dashboard'a yönlendir.
    // Aslında logo zaten bunu yapıyor, bu genel bir güvenli yönlendirme.
    navigate('/dashboard');
  };

  return (
    <nav style={styles.navbarContainer} onClick={handleNavbarClick}>
      {/* Sol Taraf: Sadece Logo - Ana sayfaya yönlendirir */}
      <div style={styles.leftSection}>
        <Link to="/dashboard" style={styles.logo}>
          NFinance
        </Link>
        {/* Hoş geldin metni kaldırıldı */}
      </div>

      {/* Sağ Taraf: Profil Resimli Alan */}
      {user && (
        <div style={styles.rightSection} ref={profileRef}>
          <div
            style={styles.profileCircle}
            onClick={handleProfileClick}
            title="Profil Ayarları"
          >
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>

          {showProfileDropdown && (
            <div style={styles.dropdownMenu}>
              <Link to="/profile" style={styles.dropdownItem} onClick={() => setShowProfileDropdown(false)}>
                Profilim
              </Link>
              <Link to="/settings" style={styles.dropdownItem} onClick={() => setShowProfileDropdown(false)}>
                Ayarlar
              </Link>
              <button onClick={handleLogout} style={styles.dropdownItemButton}>
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kullanıcı yoksa (çıkış yapılmışsa) login/register linkleri */}
      {!user && (
        <div style={styles.rightSection}>
          <Link to="/login" style={styles.navLink}>Giriş Yap</Link>
          <Link to="/register" style={styles.navLink}>Kayıt Ol</Link>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbarContainer: {
    backgroundColor: '#2c3e50',
    padding: '10px 30px',
    display: 'flex',
    justifyContent: 'space-between', // Öğeleri yatayda iki uca yaslar
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    minHeight: '60px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    // gap: '20px', // Hoş geldin metni kaldırıldığı için bu boşluğa gerek kalmadı
  },
  logo: {
    color: '#ecf0f1',
    fontSize: '24px',
    fontWeight: 'bold',
    textDecoration: 'none',
    // marginRight: '20px', // Artık tek öğe olduğu için gerek kalmadı
  },
  // welcomeText stili kaldırıldı
  rightSection: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  navLinkHover: {
    backgroundColor: '#34495e',
  },
  profileCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid white',
    boxShadow: '0 0 5px rgba(0,0,0,0.3)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: '0',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    minWidth: '150px',
    zIndex: 1100,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'block',
    padding: '12px 15px',
    textDecoration: 'none',
    color: '#333',
    fontSize: '16px',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease',
  },
  dropdownItemButton: {
    width: '100%',
    textAlign: 'left',
    padding: '12px 15px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#333',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease',
    // Son öğede border yoksa:
    // '&:last-child': { borderBottom: 'none' } // Bu inline style'da çalışmaz, CSS module veya styled-components gerekir
  },
};

export default Navbar;