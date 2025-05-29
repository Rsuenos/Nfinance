// client/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation(); // Mevcut yolu almak için
  const [openCategory, setOpenCategory] = useState(null); // Açık olan kategoriyi tutar (örn: 'finans')

  const handleCategoryClick = (categoryName) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  const handleCategoryHover = (categoryName) => {
    // İstersen sadece hover'da açılmasını buradan kontrol edebilirsin.
    // Şimdilik click bazlı yapalım, hover için farklı bir state ve logic gerekebilir.
    // setOpenCategory(categoryName);
  };

  return (
    <div style={styles.sidebar}>
      <h4 style={styles.sidebarTitle}>NFinance Menü</h4>
      <ul style={styles.navList}>
        {/* Anasayfa (Her zaman açık ve tek başına) */}
        <li style={styles.navItem}>
          <Link
            to="/dashboard"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/dashboard' ? styles.activeNavLink : {}),
            }}
          >
            Dashboard
          </Link>
        </li>

        {/* Finans Kategorisi */}
        <li style={styles.navItem}>
          <div
            style={styles.categoryHeader}
            onClick={() => handleCategoryClick('finans')}
            onMouseEnter={() => handleCategoryHover('finans')} // İstersen hover'da açılması için kullan
          >
            <Link
              to="/finans" // Finans ana sayfasına yönlendirme
              style={{
                ...styles.navLink,
                // Eğer alt menülerden biri aktifse veya ana finans sayfası aktifse
                ...(location.pathname.startsWith('/finans') || location.pathname.startsWith('/creditcards') || location.pathname.startsWith('/bankaccounts') ? styles.activeNavLink : {}),
              }}
              onClick={(e) => { // Linke tıklama olayı, kategoriyi açma kapama işlevinden sonra çalışır
                e.stopPropagation(); // Kapsayıcı div'in onClick olayını durdurur
                handleCategoryClick('finans'); // Tıklandığında da kategoriyi aç/kapa
              }}
            >
              Finans
            </Link>
            <span style={styles.arrow}>
              {openCategory === 'finans' ? '▲' : '▼'}
            </span>
          </div>
          {openCategory === 'finans' && (
          <ul style={styles.subList}>
            <li style={styles.subItem}>
              <Link
                to="/creditcards"
                style={{
                  ...styles.subLink,
                  ...(location.pathname === '/creditcards' ? styles.activeSubLink : {}),
                }}
              >
                Kredi Kartlarım
              </Link>
            </li>
            <li style={styles.subItem}>
              <Link
                to="/bankaccounts"
                style={{
                  ...styles.subLink,
                  ...(location.pathname === '/bankaccounts' ? styles.activeSubLink : {}),
                }}
              >
                Banka Hesaplarım
              </Link>
            </li>
            {/* YENİ EKLENEN KISIMLAR */}
            <li style={styles.subItem}>
              <Link
                to="/loans" // Örneğin: /loans sayfasına gidecek
                style={{
                  ...styles.subLink,
                  ...(location.pathname === '/loans' ? styles.activeSubLink : {}),
                }}
              >
                Kredilerim
              </Link>
            </li>
            <li style={styles.subItem}>
              <Link
                to="/investments" // Örneğin: /investments sayfasına gidecek
                style={{
                  ...styles.subLink,
                  ...(location.pathname === '/investments' ? styles.activeSubLink : {}),
                }}
              >
                Yatırımlarım
              </Link>
            </li>
              {/* Diğer finansal öğeler buraya eklenecek */}
            </ul>
          )}
        </li>

        {/* Raporlar Kategorisi (Örnek) */}
        <li style={styles.navItem}>
          <div
            style={styles.categoryHeader}
            onClick={() => handleCategoryClick('raporlar')}
            onMouseEnter={() => handleCategoryHover('raporlar')}
          >
            <Link
              to="/reports" // Raporlar ana sayfasına yönlendirme
              style={{
                ...styles.navLink,
                ...(location.pathname.startsWith('/reports') ? styles.activeNavLink : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick('raporlar');
              }}
            >
              Raporlar
            </Link>
            <span style={styles.arrow}>
              {openCategory === 'raporlar' ? '▲' : '▼'}
            </span>
          </div>
          {openCategory === 'raporlar' && (
            <ul style={styles.subList}>
              <li style={styles.subItem}>
                <Link
                  to="/reports/income"
                  style={{
                    ...styles.subLink,
                    ...(location.pathname === '/reports/income' ? styles.activeSubLink : {}),
                  }}
                >
                  Gelir Raporları
                </Link>
              </li>
              <li style={styles.subItem}>
                <Link
                  to="/reports/expense"
                  style={{
                    ...styles.subLink,
                    ...(location.pathname === '/reports/expense' ? styles.activeSubLink : {}),
                  }}
                >
                  Gider Raporları
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Diğer ana kategoriler buraya eklenecek */}
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '220px', // Genişletilmiş genişlik
    backgroundColor: '#34495e',
    color: 'white',
    padding: '20px 0', // Yatay padding 0 yapıldı, Link padding'i ile kontrol edelim
    height: 'calc(100vh - 60px)',
    position: 'sticky',
    top: '60px',
    left: 0,
    overflowY: 'auto',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
    transition: 'width 0.3s ease', // Genişlik değişimi için animasyon
  },
  sidebarTitle: {
    fontSize: '22px',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#ecf0f1',
    paddingBottom: '10px',
    borderBottom: '1px solid #556c80',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    marginBottom: '5px', // Menü öğeleri arası boşluk
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    display: 'block',
    padding: '12px 20px', // Daha geniş tıklama alanı
    borderRadius: '0 5px 5px 0', // Sadece sağ kenarları yuvarla
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  navLinkHover: {
    backgroundColor: '#556c80',
  },
  activeNavLink: {
    backgroundColor: '#007bff', // Aktif link rengi (Navbar mavisi ile uyumlu)
    color: 'white',
    fontWeight: 'bold',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    // Link içinde kendi padding'i olduğu için burada padding vermedik
  },
  arrow: {
    fontSize: '14px',
    marginRight: '20px', // Sağ ok simgesini menü öğesinden uzaklaştır
    color: '#ecf0f1',
  },
  subList: {
    listStyle: 'none',
    padding: '5px 0 5px 25px', // Alt öğeler için içe doğru girinti
    backgroundColor: '#4a627a', // Alt menü için biraz daha açık arka plan
    borderRadius: '0 0 5px 5px',
    // transition: 'max-height 0.3s ease-out', // Animasyon için CSS transition
    // overflow: 'hidden', // Animasyon için overflow
  },
  subItem: {
    marginBottom: '3px',
  },
  subLink: {
    color: '#ecf0f1',
    textDecoration: 'none',
    fontSize: '16px',
    display: 'block',
    padding: '8px 15px',
    borderRadius: '3px',
    transition: 'background-color 0.2s ease',
  },
  activeSubLink: {
    backgroundColor: '#0056b3', // Aktif alt link rengi
    color: 'white',
    fontWeight: 'bold',
  },
  subLinkHover: {
    backgroundColor: '#556c80',
  },
};

export default Sidebar;