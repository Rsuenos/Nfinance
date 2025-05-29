// server/routes/creditCardRoutes.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware'); // Kullanıcı yetkilendirmesi için

const prisma = new PrismaClient();
const router = express.Router();

// @route   POST /api/creditcards
// @desc    Yeni kredi kartı ekle
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, cardNumberLast4, creditLimit, dueDate, type } = req.body;
  const userId = req.userId; // authMiddleware'den gelen kullanıcı ID'si

  if (!name || !creditLimit || !dueDate) {
    return res.status(400).json({ message: 'Lütfen kart adı, limit ve son ödeme tarihini girin.' });
  }

  try {
    const newCreditCard = await prisma.creditCard.create({
      data: {
        userId,
        name,
        cardNumberLast4: cardNumberLast4 || null, // Opsiyonel
        creditLimit: parseFloat(creditLimit),
        currentDebt: 0, // Yeni eklenen kartın başlangıç borcu 0
        dueDate: new Date(dueDate), // Tarih formatı
        type: type || null, // Opsiyonel
      },
    });

    // Kredi kartı oluşturulduktan sonra availableLimit'i ayarla
    const finalCreditCard = await prisma.creditCard.update({
        where: { id: newCreditCard.id },
        data: {
            availableLimit: newCreditCard.creditLimit - newCreditCard.currentDebt
        }
    });

    res.status(201).json({ message: 'Kredi kartı başarıyla eklendi.', creditCard: finalCreditCard });
  } catch (error) {
    console.error('Kredi kartı ekleme hatası:', error);
    res.status(500).json({ message: 'Kredi kartı eklenirken bir hata oluştu.' });
  }
});

// @route   GET /api/creditcards
// @desc    Kullanıcının tüm kredi kartlarını getir
// @access  Private
router.get('/', protect, async (req, res) => {
  const userId = req.userId;

  try {
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ creditCards });
  } catch (error) {
    console.error('Kredi kartlarını getirme hatası:', error);
    res.status(500).json({ message: 'Kredi kartları getirilirken bir hata oluştu.' });
  }
});

// @route   GET /api/creditcards/:id
// @desc    Tek bir kredi kartını getir
// @access  Private
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const creditCard = await prisma.creditCard.findUnique({
      where: { id, userId }, // Kartın kullanıcıya ait olduğunu kontrol et
    });

    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı.' });
    }
    res.status(200).json({ creditCard });
  } catch (error) {
    console.error('Tek kredi kartı getirme hatası:', error);
    res.status(500).json({ message: 'Kredi kartı detayları getirilirken bir hata oluştu.' });
  }
});

// @route   PUT /api/creditcards/:id
// @desc    Kredi kartını güncelle
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { name, cardNumberLast4, creditLimit, dueDate, type } = req.body;

  try {
    const existingCard = await prisma.creditCard.findUnique({
      where: { id, userId },
    });

    if (!existingCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı veya yetkiniz yok.' });
    }

    const updatedCreditCard = await prisma.creditCard.update({
      where: { id, userId },
      data: {
        name: name || existingCard.name,
        cardNumberLast4: cardNumberLast4 || existingCard.cardNumberLast4,
        creditLimit: creditLimit ? parseFloat(creditLimit) : existingCard.creditLimit,
        dueDate: dueDate ? new Date(dueDate) : existingCard.dueDate,
        type: type || existingCard.type,
        // currentDebt ve availableLimit burada manuel olarak güncellenmez,
        // harcamalar ve ödemeler ile değişir.
      },
    });

    // Güncelleme sonrası availableLimit'i manuel hesapla ve güncelle
    const newAvailableLimit = updatedCreditCard.creditLimit - updatedCreditCard.currentDebt;
    await prisma.creditCard.update({
        where: { id: updatedCreditCard.id },
        data: { availableLimit: newAvailableLimit }
    });

    res.status(200).json({ message: 'Kredi kartı başarıyla güncellendi.', creditCard: { ...updatedCreditCard, availableLimit: newAvailableLimit } });
  } catch (error) {
    console.error('Kredi kartı güncelleme hatası:', error);
    res.status(500).json({ message: 'Kredi kartı güncellenirken bir hata oluştu.' });
  }
});

// @route   DELETE /api/creditcards/:id
// @desc    Kredi kartını sil
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const existingCard = await prisma.creditCard.findUnique({
      where: { id, userId },
    });

    if (!existingCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı veya yetkiniz yok.' });
    }

    await prisma.creditCard.delete({
      where: { id, userId },
    });
    res.status(200).json({ message: 'Kredi kartı başarıyla silindi.' });
  } catch (error) {
    console.error('Kredi kartı silme hatası:', error);
    res.status(500).json({ message: 'Kredi kartı silinirken bir hata oluştu.' });
  }
});

// @route   POST /api/creditcards/:id/pay
// @desc    Kredi kartı borcunu ödeme
// @access  Private
router.post('/:id/pay', protect, async (req, res) => {
  const { id } = req.params; // Kredi kartı ID'si
  const userId = req.userId;
  const { amount, description, bankAccountId } = req.body; // Ödenecek miktar ve opsiyonel açıklama

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Geçerli bir ödeme miktarı girin.' });
  }

  try {
    const creditCard = await prisma.creditCard.findUnique({
      where: { id, userId },
    });

    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı veya yetkiniz yok.' });
    }

    // Kredi kartı borcunu azalt
    const updatedCreditCard = await prisma.creditCard.update({
      where: { id: creditCard.id },
      data: {
        currentDebt: creditCard.currentDebt - parseFloat(amount),
      },
    });

    // availableLimit'i güncelle
    const newAvailableLimit = updatedCreditCard.creditLimit - updatedCreditCard.currentDebt;
    await prisma.creditCard.update({
        where: { id: updatedCreditCard.id },
        data: { availableLimit: newAvailableLimit }
    });

    // Ödemeyi bir gider işlemi olarak kaydet (opsiyonel olarak banka hesabından)
    await prisma.transaction.create({
      data: {
        userId,
        description: description || `Kredi Kartı Borç Ödeme: ${creditCard.name}`,
        amount: parseFloat(amount),
        type: 'expense',
        date: new Date(),
        creditCardId: creditCard.id, // Hangi kredi kartı için ödeme yapıldığı
        bankAccountId: bankAccountId || null, // Eğer ödeme bir banka hesabından yapıldıysa
      },
    });

    // Eğer banka hesabı belirtilmişse, o hesaptan parayı düş.
    if (bankAccountId) {
        const bankAccount = await prisma.bankAccount.findUnique({ where: { id: bankAccountId, userId } });
        if (bankAccount) {
            await prisma.bankAccount.update({
                where: { id: bankAccountId },
                data: { balance: bankAccount.balance - parseFloat(amount) }
            });
        }
    }


    res.status(200).json({
      message: 'Kredi kartı borcu başarıyla ödendi ve kaydedildi.',
      creditCard: { ...updatedCreditCard, availableLimit: newAvailableLimit }
    });
  } catch (error) {
    console.error('Kredi kartı borç ödeme hatası:', error);
    res.status(500).json({ message: 'Kredi kartı borcu ödenirken bir hata oluştu.' });
  }
});

module.exports = router;