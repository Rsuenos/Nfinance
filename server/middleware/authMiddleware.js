// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Authorization header yoksa veya Bearer ile başlamıyorsa
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Çözümlenmiş kullanıcı ID'sini isteğe ekle
    req.userId = decoded.userId;

    next(); // Bir sonraki middleware veya rota işleyicisine geç
  } catch (error) {
    console.error('Token doğrulama hatası:', error.message);
    return res.status(401).json({ message: 'Yetkilendirme başarısız, token geçersiz.' });
  }
};

module.exports = { protect };