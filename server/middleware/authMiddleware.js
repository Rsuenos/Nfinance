// server/middleware/authMiddleware.js

import jwt from 'jsonwebtoken'; // jwt'yi import et
import { PrismaClient } from '@prisma/client'; // PrismaClient'ı import et
const prisma = new PrismaClient(); // PrismaClient örneğini oluştur

// Bu, HTTP başlıklarından gelen token'ı doğrulayan ve user bilgisini req'e ekleyen bir middleware'dir.
const protect = async (req, res, next) => {
  let token;

  // İstek başlıklarında Authorization alanını kontrol et
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı "Bearer token" formatından al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET'ı .env dosyanızda tanımlayın

      // Çözümlenen token'daki userId'yi kullanarak kullanıcıyı veritabanından bul
      // Şifre hariç diğer bilgileri ata
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true } // Şifre dışındaki alanları seç
      });

      // Kullanıcı bulunamazsa hata döndür
      if (!req.user) {
        res.status(401);
        throw new Error('Kullanıcı bulunamadı, yetkilendirme başarısız.');
      }

      next(); // Middleware'den sonraki fonksiyona geç
    } catch (error) {
      console.error('Yetkilendirme Hatası:', error.message);
      res.status(401).json({ message: 'Yetkilendirme başarısız, token geçersiz.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı.' });
  }
};

// ES Modülü isimlendirilmiş dışa aktarımı (önceden 'module.exports = { protect };' idi)
export { protect };