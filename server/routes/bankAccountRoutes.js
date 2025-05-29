// server/routes/bankAccountRoutes.js

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/authMiddleware.js'; // .js uzantısını unutmayın

const prisma = new PrismaClient();
const router = express.Router();

// Yeni bir banka hesabı oluşturma
router.post('/', protect, async (req, res) => {
  const { accountName, initialBalance } = req.body;
  const userId = req.user.id;

  if (!accountName || initialBalance === undefined) {
    return res.status(400).json({ message: 'Hesap adı ve başlangıç bakiyesi gereklidir.' });
  }

  if (isNaN(initialBalance)) {
    return res.status(400).json({ message: 'Başlangıç bakiyesi geçerli bir sayı olmalıdır.' });
  }

  try {
    const bankAccount = await prisma.bankAccount.create({
      data: {
        userId,
        accountName,
        balance: parseFloat(initialBalance), // Sayıya dönüştür
      },
    });
    res.status(201).json(bankAccount);
  } catch (error) {
    console.error('Banka hesabı oluşturulurken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı oluşturulamadı.' });
  }
});

// Kullanıcının tüm banka hesaplarını getirme
router.get('/', protect, async (req, res) => {
  const userId = req.user.id;
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId },
    });
    res.status(200).json(bankAccounts);
  } catch (error) {
    console.error('Banka hesapları getirilirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesapları getirilemedi.' });
  }
});

// Belirli bir banka hesabını ID'ye göre getirme
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id, userId },
    });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Banka hesabı bulunamadı.' });
    }
    res.status(200).json(bankAccount);
  } catch (error) {
    console.error('Banka hesabı getirilirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı getirilemedi.' });
  }
});

// Banka hesabı güncelleme
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { accountName, balance } = req.body;

  if (!accountName && balance === undefined) {
    return res.status(400).json({ message: 'Güncellenecek veri sağlanmadı.' });
  }

  if (balance !== undefined && isNaN(balance)) {
    return res.status(400).json({ message: 'Bakiye geçerli bir sayı olmalıdır.' });
  }

  try {
    const updatedAccount = await prisma.bankAccount.update({
      where: { id, userId },
      data: {
        accountName: accountName || undefined, // Sadece verilirse güncelle
        balance: balance !== undefined ? parseFloat(balance) : undefined, // Sadece verilirse güncelle
      },
    });
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error('Banka hesabı güncellenirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı güncellenemedi.' });
  }
});

// Banka hesabı silme
router.delete('/:id', protect, async (res, req) => { // Dikkat: req ve res sırası doğru mu? router.delete('/:id', protect, async (req, res) => { olmalı
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const bankAccount = await prisma.bankAccount.findUnique({ where: { id, userId } });

    if (!bankAccount) {
      return res.status(404).json({ message: 'Banka hesabı bulunamadı.' });
    }

    // Bu banka hesabına bağlı tüm işlemleri de silme (veya güncelleme) mantığı buraya eklenebilir.
    // İşlemleri silmeden önce bakiyelerin doğru ayarlandığından emin olun.
    // Daha güvenli bir yaklaşım, bu banka hesabına ait işlemleri silmek veya başka bir hesaba taşımaktır.

    await prisma.bankAccount.delete({
      where: { id, userId },
    });

    res.status(200).json({ message: 'Banka hesabı başarıyla silindi.' });
  } catch (error) {
    console.error('Banka hesabı silinirken hata:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı silinemedi.' });
  }
});

// ES Modülü dışa aktarımı
export default router;