// server/routes/bankAccountRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect } = require('../middleware/authMiddleware'); // Kimlik doğrulama middleware'iniz

// @route   GET /api/bankaccounts
// @desc    Get all bank accounts for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        userId: req.userId, // authMiddleware'den gelen kullanıcı ID'si
      },
      orderBy: {
        createdAt: 'desc', // En yeniyi üste al
      },
    });
    res.json(bankAccounts);
  } catch (err) {
    console.error('Banka hesaplarını alırken hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesapları yüklenemedi.' });
  }
});

// @route   POST /api/bankaccounts
// @desc    Add a new bank account
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, balance, currency, accountNumber, iban, type } = req.body;

  // Basit validasyon
  if (!name || balance === undefined || !currency) {
    return res.status(400).json({ message: 'Hesap adı, bakiye ve para birimi gereklidir.' });
  }

  try {
    const newBankAccount = await prisma.bankAccount.create({
      data: {
        userId: req.userId,
        name,
        balance,
        currency,
        accountNumber,
        iban,
        type,
      },
    });
    res.status(201).json({
        message: 'Banka hesabı başarıyla eklendi.',
        bankAccount: newBankAccount
    });
  } catch (err) {
    console.error('Banka hesabı eklerken hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı eklenemedi.' });
  }
});

// @route   PUT /api/bankaccounts/:id
// @desc    Update a bank account
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { name, balance, currency, accountNumber, iban, type } = req.body;

  try {
    const updatedBankAccount = await prisma.bankAccount.updateMany({
      where: {
        id: id,
        userId: req.userId, // Yalnızca kullanıcının kendi hesabını güncellemesini sağla
      },
      data: {
        name,
        balance,
        currency,
        accountNumber,
        iban,
        type,
        updatedAt: new Date(), // Güncelleme tarihini manuel olarak ayarla
      },
    });

    if (updatedBankAccount.count === 0) {
        return res.status(404).json({ message: 'Banka hesabı bulunamadı veya size ait değil.' });
    }

    // Güncel veriyi döndürmek için tekrar çekebilirsiniz, veya sadece başarı mesajı dönebilirsiniz
    const bankAccount = await prisma.bankAccount.findUnique({ where: { id: id } });
    res.json({
        message: 'Banka hesabı başarıyla güncellendi.',
        bankAccount: bankAccount
    });
  } catch (err) {
    console.error('Banka hesabını güncellerken hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı güncellenemedi.' });
  }
});

// @route   DELETE /api/bankaccounts/:id
// @desc    Delete a bank account
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBankAccount = await prisma.bankAccount.deleteMany({
      where: {
        id: id,
        userId: req.userId, // Yalnızca kullanıcının kendi hesabını silmesini sağla
      },
    });

    if (deletedBankAccount.count === 0) {
        return res.status(404).json({ message: 'Banka hesabı bulunamadı veya size ait değil.' });
    }

    res.json({ message: 'Banka hesabı başarıyla silindi.' });
  } catch (err) {
    console.error('Banka hesabını silerken hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası: Banka hesabı silinemedi.' });
  }
});

module.exports = router;