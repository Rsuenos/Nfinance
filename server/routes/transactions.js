// server/routes/transactions.js

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/authMiddleware.js'; // .js uzantısını ve protect'in ES Modülü export'unu unutmayın

const prisma = new PrismaClient();
const router = express.Router();

// Yeni bir işlem ekleme rotası
router.post('/', protect, async (req, res) => {
  const {
    type, // 'income', 'expense', 'transfer'
    amount,
    description,
    date,
    bankAccountId, // Transfer için kaynak hesap veya genel işlem için
    creditCardId, // Kredi kartı işlemi için
    toBankAccountId, // Transfer için hedef hesap
    categoryId // opsiyonel
  } = req.body;
  const userId = req.user.id; // protect middleware'inden gelen kullanıcı ID'si

  // Temel doğrulama
  if (!type || !amount || !date) {
    return res.status(400).json({ message: 'Tipi, miktarı ve tarihi belirtmelisiniz.' });
  }

  // Miktarın geçerliliği
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Geçerli bir miktar girmelisiniz.' });
  }

  // Tarih doğrulama (daha katı kurallar eklenebilir)
  if (isNaN(new Date(date).getTime())) {
    return res.status(400).json({ message: 'Geçerli bir tarih girmelisiniz.' });
  }

  try {
    let newTransaction;
    let fromAccount, toAccount, creditCard;

    switch (type) {
      case 'income':
        if (!bankAccountId) {
          return res.status(400).json({ message: 'Gelir için banka hesabı belirtmelisiniz.' });
        }
        fromAccount = await prisma.bankAccount.findUnique({ where: { id: bankAccountId, userId } });
        if (!fromAccount) return res.status(404).json({ message: 'Banka hesabı bulunamadı.' });

        newTransaction = await prisma.transaction.create({
          data: {
            type: 'INCOME',
            amount,
            description,
            date: new Date(date),
            userId,
            bankAccountId: fromAccount.id,
            categoryId
          }
        });

        await prisma.bankAccount.update({
          where: { id: fromAccount.id },
          data: { balance: { increment: amount } }
        });
        break;

      case 'expense':
        if (!bankAccountId && !creditCardId) {
          return res.status(400).json({ message: 'Gider için banka hesabı veya kredi kartı belirtmelisiniz.' });
        }

        if (bankAccountId) {
          fromAccount = await prisma.bankAccount.findUnique({ where: { id: bankAccountId, userId } });
          if (!fromAccount) return res.status(404).json({ message: 'Banka hesabı bulunamadı.' });

          // Bakiyenin yeterli olup olmadığını kontrol et
          if (fromAccount.balance < amount) {
            return res.status(400).json({ message: 'Yetersiz bakiye.' });
          }

          newTransaction = await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              amount,
              description,
              date: new Date(date),
              userId,
              bankAccountId: fromAccount.id,
              categoryId
            }
          });
          await prisma.bankAccount.update({
            where: { id: fromAccount.id },
            data: { balance: { decrement: amount } }
          });
        } else if (creditCardId) {
          creditCard = await prisma.creditCard.findUnique({ where: { id: creditCardId, userId } });
          if (!creditCard) return res.status(404).json({ message: 'Kredi kartı bulunamadı.' });

          // Kredi kartı limitini kontrol et
          if (creditCard.availableLimit < amount) {
            return res.status(400).json({ message: 'Kredi kartı limitiniz yeterli değil.' });
          }

          newTransaction = await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              amount,
              description,
              date: new Date(date),
              userId,
              creditCardId: creditCard.id,
              categoryId
            }
          });
          await prisma.creditCard.update({
            where: { id: creditCard.id },
            data: {
              currentDebt: { increment: amount },
              availableLimit: { decrement: amount }
            }
          });
        }
        break;

      case 'transfer':
        if (!bankAccountId || !toBankAccountId || bankAccountId === toBankAccountId) {
          return res.status(400).json({ message: 'Geçerli bir transfer için kaynak ve hedef hesap belirtmelisiniz.' });
        }

        fromAccount = await prisma.bankAccount.findUnique({ where: { id: bankAccountId, userId } });
        toAccount = await prisma.bankAccount.findUnique({ where: { id: toBankAccountId, userId } });

        if (!fromAccount || !toAccount) {
          return res.status(404).json({ message: 'Kaynak veya hedef banka hesabı bulunamadı.' });
        }

        // Kaynak hesap bakiyesini kontrol et
        if (fromAccount.balance < amount) {
          return res.status(400).json({ message: 'Kaynak hesapta yeterli bakiye yok.' });
        }

        // İşlemleri bir transaction içinde yap (atomik olması için)
        await prisma.$transaction(async (tx) => {
          // Kaynaktan düş
          await tx.bankAccount.update({
            where: { id: fromAccount.id },
            data: { balance: { decrement: amount } }
          });

          // Hedefe ekle
          await tx.bankAccount.update({
            where: { id: toAccount.id },
            data: { balance: { increment: amount } }
          });

          // Transfer işlemini kaydet
          newTransaction = await tx.transaction.create({
            data: {
              type: 'TRANSFER',
              amount,
              description: description || `Transfer: ${fromAccount.accountName} -> ${toAccount.accountName}`,
              date: new Date(date),
              userId,
              bankAccountId: fromAccount.id, // Transferin kaynağı olarak bankAccountId'yi kullan
              toBankAccountId: toAccount.id // Hedef hesabı belirt
            }
          });
        });
        break;

      default:
        return res.status(400).json({ message: 'Geçersiz işlem tipi.' });
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error('İşlem eklerken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlem eklenemedi.' });
  }
});

// Tüm işlemleri getirme rotası
router.get('/', protect, async (req, res) => {
  const userId = req.user.id;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        bankAccount: { select: { id: true, accountName: true, balance: true } },
        creditCard: { select: { id: true, cardNumber: true, cardName: true } },
        toBankAccount: { select: { id: true, accountName: true } }, // Transferin hedef hesabı
        category: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.status(200).json(transactions);
  } catch (err) {
    console.error('İşlemleri getirirken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlemler getirilemedi.' });
  }
});

// Tek bir işlemi ID'ye göre getirme rotası
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id, userId },
      include: {
        bankAccount: { select: { id: true, accountName: true, balance: true } },
        creditCard: { select: { id: true, cardNumber: true, cardName: true } },
        toBankAccount: { select: { id: true, accountName: true } },
        category: { select: { id: true, name: true } }
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı.' });
    }
    res.status(200).json(transaction);
  } catch (err) {
    console.error('İşlemi getirirken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlem getirilemedi.' });
  }
});

// İşlem güncelleme rotası
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const {
    type,
    amount,
    description,
    date,
    bankAccountId,
    creditCardId,
    toBankAccountId,
    categoryId
  } = req.body;

  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id, userId },
      include: { bankAccount: true, creditCard: true, toBankAccount: true } // Eski değerleri kontrol etmek için
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı.' });
    }

    // Önemli: Güncelleme yaparken eski bakiyeleri ve yeni bakiyeleri dikkate almalısınız.
    // Bu, oldukça karmaşık bir mantık gerektirir çünkü işlem tipi, miktar ve ilgili hesaplar değişebilir.
    // Basitlik adına, burada sadece Transaction kaydını güncelliyoruz,
    // ancak gerçek bir uygulamada bu bölüm detaylı bakiye ayarlaması içermelidir.
    // Örneğin, eski miktarı geri ekleyip yeni miktarı düşmek/eklemek gerekebilir.

    /*
    const oldAmount = existingTransaction.amount;
    if (existingTransaction.bankAccountId) {
        await prisma.bankAccount.update({
            where: { id: existingTransaction.bankAccountId },
            data: { balance: { [existingTransaction.type === 'INCOME' ? 'decrement' : 'increment']: oldAmount } }
        });
    } else if (existingTransaction.creditCardId) {
        // Kredi kartı için benzer mantık
    }
    // Şimdi yeni miktarı ve hesapları kullanarak tekrar ekleme/düşme yapın
    */

    const updatedTransaction = await prisma.transaction.update({
      where: { id, userId },
      data: {
        type: type || existingTransaction.type,
        amount: amount || existingTransaction.amount,
        description: description || existingTransaction.description,
        date: date ? new Date(date) : existingTransaction.date,
        bankAccountId: bankAccountId || existingTransaction.bankAccountId,
        creditCardId: creditCardId || existingTransaction.creditCardId,
        toBankAccountId: toBankAccountId || existingTransaction.toBankAccountId,
        categoryId: categoryId || existingTransaction.categoryId
      },
      include: {
        bankAccount: { select: { id: true, accountName: true } },
        creditCard: { select: { id: true, cardNumber: true } },
        toBankAccount: { select: { id: true, accountName: true } },
        category: { select: { id: true, name: true } }
      }
    });

    res.status(200).json(updatedTransaction);
  } catch (err) {
    console.error('İşlemi güncellerken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlem güncellenemedi.' });
  }
});

// İşlem silme rotası
router.delete('/:id', protect, async (req, res) => { // req ve res sırası doğru
  const { id } = req.params;
  const userId = req.user.id; // protect middleware'inden gelen kullanıcı ID'si

  try {
    const transactionToDelete = await prisma.transaction.findUnique({
      where: { id, userId },
      include: { bankAccount: true, creditCard: true, toBankAccount: true }
    });

    if (!transactionToDelete) {
      return res.status(404).json({ message: 'İşlem bulunamadı.' });
    }

    // İşlem tipine göre bakiyeleri geri al
    const { type, amount, bankAccount, creditCard, toBankAccount } = transactionToDelete;

    if (type === 'INCOME' && bankAccount) {
      await prisma.bankAccount.update({
        where: { id: bankAccount.id },
        data: { balance: { decrement: amount } }
      });
    } else if (type === 'EXPENSE') {
      if (bankAccount) {
        await prisma.bankAccount.update({
          where: { id: bankAccount.id },
          data: { balance: { increment: amount } }
        });
      } else if (creditCard) {
        await prisma.creditCard.update({
          where: { id: creditCard.id },
          data: {
            currentDebt: { decrement: amount },
            availableLimit: { increment: amount }
          }
        });
      }
    } else if (type === 'TRANSFER' && bankAccount && toBankAccount) {
      // Transferi geri al: kaynaktan ekle, hedeften düş
      await prisma.bankAccount.update({
        where: { id: bankAccount.id }, // Eski kaynak hesap
        data: { balance: { increment: amount } }
      });
      await prisma.bankAccount.update({
        where: { id: toBankAccount.id }, // Eski hedef hesap
        data: { balance: { decrement: amount } }
      });
    }

    await prisma.transaction.delete({ where: { id, userId } });

    res.json({ message: 'İşlem başarıyla silindi ve bakiyeler güncellendi.' });
  } catch (err) {
    console.error('İşlemi silerken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlem silinemedi.' });
  }
});

// ES Modülü dışa aktarımı
export default router;