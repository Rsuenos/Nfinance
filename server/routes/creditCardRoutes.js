// server/routes/creditCardRoutes.js

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/authMiddleware.js'; // .js uzantısını unutmayın

const prisma = new PrismaClient();
const router = express.Router();

// Yeni bir kredi kartı ekleme
router.post('/', protect, async (req, res) => {
  const { cardName, cardNumber, expirationDate, creditLimit, availableLimit } = req.body;
  const userId = req.user.id; // protect middleware'inden gelen kullanıcı ID'si

  if (!cardName || !cardNumber || !expirationDate || creditLimit === undefined || availableLimit === undefined) {
    return res.status(400).json({ message: 'Tüm alanları doldurmanız gerekmektedir.' });
  }

  // Sayısal değerlerin doğrulanması
  if (isNaN(creditLimit) || isNaN(availableLimit) || creditLimit < 0 || availableLimit < 0) {
    return res.status(400).json({ message: 'Limit değerleri geçerli sayılar olmalıdır.' });
  }

  try {
    const creditCard = await prisma.creditCard.create({
      data: {
        userId,
        cardName,
        cardNumber,
        expirationDate: new Date(expirationDate), // Tarih objesine dönüştür
        creditLimit: parseFloat(creditLimit),
        availableLimit: parseFloat(availableLimit),
        currentDebt: parseFloat(creditLimit) - parseFloat(availableLimit) // Borç hesaplaması
      },
    });
    res.status(201).json(creditCard);
  } catch (error) {
    console.error('Kredi kartı eklenirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Kredi kartı eklenemedi.' });
  }
});

// Tüm kredi kartlarını getirme
router.get('/', protect, async (req, res) => {
  const userId = req.user.id;
  try {
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
      orderBy: { cardName: 'asc' }
    });
    res.status(200).json(creditCards);
  } catch (error) {
    console.error('Kredi kartları getirilirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Kredi kartları getirilemedi.' });
  }
});

// ID'ye göre kredi kartı getirme
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const creditCard = await prisma.creditCard.findUnique({
      where: { id, userId },
    });
    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı.' });
    }
    res.status(200).json(creditCard);
  } catch (error) {
    console.error('Kredi kartı getirilirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Kredi kartı getirilemedi.' });
  }
});

// Kredi kartı güncelleme
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { cardName, cardNumber, expirationDate, creditLimit, availableLimit } = req.body;

  try {
    const updatedCreditCard = await prisma.creditCard.update({
      where: { id, userId },
      data: {
        cardName: cardName || undefined,
        cardNumber: cardNumber || undefined,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        creditLimit: creditLimit !== undefined ? parseFloat(creditLimit) : undefined,
        availableLimit: availableLimit !== undefined ? parseFloat(availableLimit) : undefined,
        currentDebt: (creditLimit !== undefined && availableLimit !== undefined) ?
                     parseFloat(creditLimit) - parseFloat(availableLimit) : undefined
      },
    });
    res.status(200).json(updatedCreditCard);
  } catch (error) {
    console.error('Kredi kartı güncellenirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Kredi kartı güncellenemedi.' });
  }
});

// Kredi kartı silme
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const creditCard = await prisma.creditCard.findUnique({ where: { id, userId } });

    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı.' });
    }

    // Bu kredi kartına bağlı tüm işlemleri de silme (veya güncelleme) mantığı buraya eklenebilir.
    // İşlemleri silmeden önce borç bakiyelerinin doğru ayarlandığından emin olun.

    await prisma.creditCard.delete({
      where: { id, userId },
    });

    res.status(200).json({ message: 'Kredi kartı başarıyla silindi.' });
  } catch (error) {
    console.error('Kredi kartı silinirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Kredi kartı silinemedi.' });
  }
});

// ES Modülü dışa aktarımı
export default router;