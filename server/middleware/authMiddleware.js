// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // İstek başlıklarında 'Authorization' alanında token olup olmadığını kontrol et
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı al (Bearer kelimesinden sonraki kısım)
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Çözümlenmiş kullanıcı ID'sini isteğe ekle
      req.userId = decoded.userId;

      next(); // Bir sonraki middleware veya rota işleyicisine geç
    } catch (error) {
      console.error('Token doğrulama hatası:', error.message);
      return res.status(401).json({ message: 'Yetkilendirme başarısız, token geçersiz.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı.' });
  }
};

module.exports = { protect };