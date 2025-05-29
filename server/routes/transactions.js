// server/routes/transactions.js
import { Router } from 'express'; // SADECE BU SATIR OLMALI!
const router = Router();

// const { Transaction, BankAccount, CreditCard } = require('../models'); // Bu satırlara gerek yoktu
// const { Op } = require('sequelize'); // Bu satırlara gerek yoktu

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { protect } from '../middleware/authMiddleware.js'; // Kimlik doğrulama middleware'i
// @route   POST /api/transactions
// @desc    Add a new financial transaction (income, expense, transfer)
// @access  Private
router.post('/', protect, async (req, res) => {
  const {
    type,               // 'income', 'expense', 'transfer'
    amount,             // İşlem miktarı
    date,               // İşlem tarihi (örn: "2025-05-28")
    description,        // Açıklama
    // userId,          // req.userId zaten protect middleware'i tarafından sağlanıyor
    category,           // Kategori (sadece gelir ve harcama için)
    sourceAccountId,    // Kaynak hesap/kart ID'si
    sourceAccountType,  // Kaynak hesap/kart tipi ('BankAccount', 'CreditCard', 'Loan')
    destinationAccountId,   // Hedef hesap/kart ID'si (sadece gelir ve transfer için)
    destinationAccountType, // Hedef hesap/kart tipi ('BankAccount', 'CreditCard', 'Loan')
    transferType        // Sadece 'transfer' işlemi için özel tip (örn: 'bank_to_credit_card')
  } = req.body;

  // Gelen veriyi logla, bu debugging için çok önemli!
  console.log('API ye gelen transaction verisi:', req.body);
  console.log('API ye gelen userId:', req.userId); // req.userId'nin doğru geldiğini kontrol edin

  // Veri doğrulama
  if (!type || amount === undefined || !date) { // req.userId zaten middleware'de kontrol ediliyor
    return res.status(400).json({ message: 'Lütfen tüm gerekli alanları doldurun.' });
  }

  // Miktarın pozitif olduğundan emin ol
  if (amount <= 0) {
    return res.status(400).json({ message: 'Tutar sıfırdan büyük olmalıdır.' });
  }

  const transactionDate = new Date(date); // Tarihi Date objesine çevir

  try {
    // Prisma transaction kullanarak hem işlemi oluştur hem de bakiyeleri güncelle
    const newTransaction = await prisma.$transaction(async (prismaTx) => {

      // 1. Kaynak Hesabı/Kartı Bağlama İçin Gerekli Veriyi Hazırla ve Doğrula
      let sourceConnectData = {};
      let sourceAccount = null; // Bakiye güncellemesi için hesabı/kartı tutacak

      if (sourceAccountId && sourceAccountType) {
        // Kaynak hesap/kartı bul ve kullanıcıya ait olduğunu doğrula
        if (sourceAccountType === 'BankAccount') {
          sourceAccount = await prismaTx.bankAccount.findUnique({ where: { id: sourceAccountId, userId: req.userId } });
          sourceConnectData.sourceBankAccountId = sourceAccountId;
        } else if (sourceAccountType === 'CreditCard') {
          sourceAccount = await prismaTx.creditCard.findUnique({ where: { id: sourceAccountId, userId: req.userId } });
          sourceConnectData.sourceCreditCardId = sourceAccountId;
        } else if (sourceAccountType === 'Loan') {
          sourceAccount = await prismaTx.loan.findUnique({ where: { id: sourceAccountId, userId: req.userId } });
          sourceConnectData.sourceLoanId = sourceAccountId;
        }

        if (!sourceAccount) {
          throw new Error(`Kaynak ${sourceAccountType} bulunamadı veya size ait değil.`);
        }
      } else if (type === 'expense' || type === 'transfer') {
        // Harcama ve transfer için kaynak zorunlu
        throw new Error('Harcama veya transfer işlemi için kaynak hesap/kart bilgisi zorunludur.');
      }


      // 2. Hedef Hesabı/Kartı Bağlama İçin Gerekli Veriyi Hazırla ve Doğrula
      let destinationConnectData = {};
      let destinationAccount = null; // Bakiye güncellemesi için hesabı/kartı tutacak

      if (destinationAccountId && destinationAccountType) {
        // Hedef hesap/kartı bul ve kullanıcıya ait olduğunu doğrula
        if (destinationAccountType === 'BankAccount') {
          destinationAccount = await prismaTx.bankAccount.findUnique({ where: { id: destinationAccountId, userId: req.userId } });
          destinationConnectData.destinationBankAccountId = destinationAccountId;
        } else if (destinationAccountType === 'CreditCard') {
          destinationAccount = await prismaTx.creditCard.findUnique({ where: { id: destinationAccountId, userId: req.userId } });
          destinationConnectData.destinationCreditCardId = destinationAccountId;
        } else if (destinationAccountType === 'Loan') {
          destinationAccount = await prismaTx.loan.findUnique({ where: { id: destinationAccountId, userId: req.userId } });
          destinationConnectData.destinationLoanId = destinationAccountId;
        }

        if (!destinationAccount) {
          throw new Error(`Hedef ${destinationAccountType} bulunamadı veya size ait değil.`);
        }
      } else if (type === 'income' || type === 'transfer') {
        // Gelir ve transfer için hedef zorunlu
        throw new Error('Gelir veya transfer işlemi için hedef hesap/kart bilgisi zorunludur.');
      }


      // 3. Yeni İşlemi Oluştur
      const createdTransaction = await prismaTx.transaction.create({
        data: {
          userId: req.userId,
          type,
          amount,
          date: transactionDate,
          description: description || '',
          category: category || '',
          transferType: transferType || null,
          ...sourceConnectData,    // Artık doğrudan ID'ler yayılıyor
          ...destinationConnectData,    // Artık doğrudan ID'ler yayılıyor
        },
      });

      // 4. Hesap Bakiyelerini Güncelle (Atomik olarak Prisma Transaction içinde)
      if (type === 'expense' || type === 'transfer') {
        if (!sourceAccount) { // Zaten yukarıda kontrol edildi ama bir kez daha sağlamlık için
          throw new Error('Kaynak hesap/kart bulunamadı veya seçilmediği için bakiye güncellenemedi.');
        }
        if (sourceAccountType === 'BankAccount') {
          await prismaTx.bankAccount.update({
            where: { id: sourceAccountId },
            data: { balance: { decrement: amount } },
          });
        } else if (sourceAccountType === 'CreditCard') {
          await prismaTx.creditCard.update({
            where: { id: sourceAccountId },
            data: { currentDebt: { increment: amount } }, // Harcama kredi kartı borcunu artırır
          });
        }
        // TODO: Loan'dan harcama/transfer mantığı buraya eklenebilir
      }

      if (type === 'income' || type === 'transfer') {
        if (!destinationAccount) { // Zaten yukarıda kontrol edildi ama bir kez daha sağlamlık için
          throw new Error('Hedef hesap/kart bulunamadı veya seçilmediği için bakiye güncellenemedi.');
        }
        if (destinationAccountType === 'BankAccount') {
          await prismaTx.bankAccount.update({
            where: { id: destinationAccountId },
            data: { balance: { increment: amount } },
          });
        } else if (destinationAccountType === 'CreditCard') {
          await prismaTx.creditCard.update({
            where: { id: destinationAccountId },
            data: { currentDebt: { decrement: amount } }, // Gelir kredi kartı borcunu azaltır (ödeme gibi)
          });
        }
        // TODO: Loan'a gelir/transfer mantığı buraya eklenebilir
      }

      return createdTransaction;
    });

    res.status(201).json({ message: 'İşlem başarıyla eklendi.', transaction: newTransaction });

  } catch (err) {
    console.error('İşlem ekleme hatası:', err.message);
    // Sentry'ye hatayı gönderin (eğer backend Sentry kurulumu doğruysa bu otomatik çalışacaktır)
    // Sentry.captureException(err); // Sentry error handler middleware'i bunu zaten yapar

    let errorMessage = err.message || 'Sunucu hatası: İşlem eklenemedi.';

    if (err.message.includes('Foreign key constraint failed')) {
      errorMessage = 'Geçersiz hesap/kart seçimi veya kullanıcıya ait olmayan bir hesap/kart.';
    } else if (err.message.includes('A unique constraint violation')) {
      errorMessage = 'Bu işlem zaten mevcut veya benzersizlik hatası oluştu.';
    } else if (err.message.includes('not found for this user')) { // Kendi attığımız hata mesajlarını yakalama
        errorMessage = err.message;
    }

    res.status(500).json({ message: errorMessage });
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        sourceBankAccount: true,
        sourceCreditCard: true,
        sourceLoan: true, // Eğer Loan modeliniz varsa
        destinationBankAccount: true,
        destinationCreditCard: true,
        destinationLoan: true, // Eğer Loan modeliniz varsa
      },
      orderBy: {
        date: 'desc',
      },
    });
    res.json(transactions);
  } catch (err) {
    console.error('İşlemleri alırken hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası: İşlemler yüklenemedi.' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get a single transaction by ID for the authenticated user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: id,
        userId: req.userId,
      },
      include: {
        sourceBankAccount: true,
        sourceCreditCard: true,
        sourceLoan: true,
        destinationBankAccount: true,
        destinationCreditCard: true,
        destinationLoan: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı veya size ait değil.' });
    }
    res.json(transaction);
  } catch (err) {
    console.error('İşlemi alırken hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası: İşlem yüklenemedi.' });
  }
});


// @route   PUT /api/transactions/:id
// @desc    Update a transaction by ID for the authenticated user
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const {
    type,
    amount,
    date,
    description,
    category,
    sourceAccountId,
    sourceAccountType,
    destinationAccountId,
    destinationAccountType,
    transferType
  } = req.body;

  console.log('Güncelleme için gelen transaction verisi:', req.body);
  console.log('Güncelleme için gelen userId:', req.userId);


  if (amount <= 0) {
    return res.status(400).json({ message: 'Tutar sıfırdan büyük olmalıdır.' });
  }

  try {
    const oldTransaction = await prisma.transaction.findUnique({
      where: { id: id, userId: req.userId },
      include: {
        sourceBankAccount: true,
        sourceCreditCard: true,
        sourceLoan: true,
        destinationBankAccount: true,
        destinationCreditCard: true,
        destinationLoan: true,
      },
    });

    if (!oldTransaction) {
      return res.status(404).json({ message: 'Güncellenecek işlem bulunamadı veya size ait değil.' });
    }

    const updatedTransaction = await prisma.$transaction(async (prismaTx) => {
      // 1. Önceki İşlemin Bakiyelerini Geri Al (Eski transaction'a göre)
      if (oldTransaction.type === 'expense' || oldTransaction.type === 'transfer') {
        if (oldTransaction.sourceBankAccount) {
          await prismaTx.bankAccount.update({
            where: { id: oldTransaction.sourceBankAccount.id },
            data: { balance: { increment: oldTransaction.amount } }, // Eski harcamayı geri al
          });
        } else if (oldTransaction.sourceCreditCard) {
          await prismaTx.creditCard.update({
            where: { id: oldTransaction.sourceCreditCard.id },
            data: { currentDebt: { decrement: oldTransaction.amount } }, // Eski borcu azalt
          });
        }
        // TODO: Loan'dan eski harcama/transfer mantığı buraya eklenebilir
      }

      if (oldTransaction.type === 'income' || oldTransaction.type === 'transfer') {
        if (oldTransaction.destinationBankAccount) {
          await prismaTx.bankAccount.update({
            where: { id: oldTransaction.destinationBankAccount.id },
            data: { balance: { decrement: oldTransaction.amount } }, // Eski geliri geri al
          });
        } else if (oldTransaction.destinationCreditCard) {
          await prismaTx.creditCard.update({
            where: { id: oldTransaction.destinationCreditCard.id },
            data: { currentDebt: { increment: oldTransaction.amount } }, // Eski kredi kartı borcunu artır (ödeme gibi)
          });
        }
        // TODO: Loan'a eski gelir/transfer mantığı buraya eklenebilir
      }

      // 2. Yeni İlişki Verilerini Hazırla (connect/disconnect mantığı update için doğru)
      let updateData = {
        type,
        amount,
        date: new Date(date),
        description: description || '',
        category: category || '',
        transferType: transferType || null,
        updatedAt: new Date(),
      };

      // İlişki alanlarını sıfırlama veya yeni bağlantı kurma
      updateData.sourceBankAccount = { disconnect: true };
      updateData.sourceCreditCard = { disconnect: true };
      updateData.sourceLoan = { disconnect: true };
      updateData.sourceBankAccountId = null;
      updateData.sourceCreditCardId = null;
      updateData.sourceLoanId = null;

      updateData.destinationBankAccount = { disconnect: true };
      updateData.destinationCreditCard = { disconnect: true };
      updateData.destinationLoan = { disconnect: true };
      updateData.destinationBankAccountId = null;
      updateData.destinationCreditCardId = null;
      updateData.destinationLoanId = null;


      // Yeni kaynak bağlantısı
      if (sourceAccountId && sourceAccountType) {
        if (sourceAccountType === 'BankAccount') {
          updateData.sourceBankAccount = { connect: { id: sourceAccountId } };
          updateData.sourceBankAccountId = sourceAccountId;
        } else if (sourceAccountType === 'CreditCard') {
          updateData.sourceCreditCard = { connect: { id: sourceAccountId } };
          updateData.sourceCreditCardId = sourceAccountId;
        } else if (sourceAccountType === 'Loan') {
          updateData.sourceLoan = { connect: { id: sourceAccountId } };
          updateData.sourceLoanId = sourceAccountId;
        } else {
          throw new Error('Geçersiz kaynak hesap/kart tipi.');
        }
      } else if (type === 'expense' || type === 'transfer') {
          throw new Error('Harcama veya transfer işlemi için kaynak hesap/kart bilgisi zorunludur.');
      }

      // Yeni hedef bağlantısı
      if (destinationAccountId && destinationAccountType) {
        if (destinationAccountType === 'BankAccount') {
          updateData.destinationBankAccount = { connect: { id: destinationAccountId } };
          updateData.destinationBankAccountId = destinationAccountId;
        } else if (destinationAccountType === 'CreditCard') {
          updateData.destinationCreditCard = { connect: { id: destinationAccountId } };
          updateData.destinationCreditCardId = destinationAccountId;
        } else if (destinationAccountType === 'Loan') {
          updateData.destinationLoan = { connect: { id: destinationAccountId } };
          updateData.destinationLoanId = destinationAccountId;
        } else {
          throw new Error('Geçersiz hedef hesap/kart tipi.');
        }
      } else if (type === 'income' || type === 'transfer') {
          throw new Error('Gelir veya transfer işlemi için hedef hesap/kart bilgisi zorunludur.');
      }


      // 3. İşlemi Güncelle
      const updated = await prismaTx.transaction.update({
        where: { id: id, userId: req.userId },
        data: updateData,
      });

      // 4. Yeni İşlemin Bakiyelerini Güncelle (Yeni değerlere göre)
      if (type === 'expense' || type === 'transfer') {
        if (!sourceAccountId || !sourceAccountType) {
          throw new Error('Kaynak hesap/kart bilgisi eksik olduğu için bakiye güncellenemedi.');
        }
        // Kaynak hesabı/kartı bul ve kullanıcıya ait olduğunu tekrar doğrula
        const currentSourceAccount = await (sourceAccountType === 'BankAccount' ? prismaTx.bankAccount.findUnique({ where: { id: sourceAccountId, userId: req.userId } }) :
                                         sourceAccountType === 'CreditCard' ? prismaTx.creditCard.findUnique({ where: { id: sourceAccountId, userId: req.userId } }) :
                                         sourceAccountType === 'Loan' ? prismaTx.loan.findUnique({ where: { id: sourceAccountId, userId: req.userId } }) : null);

        if (!currentSourceAccount) {
            throw new Error(`Kaynak ${sourceAccountType} bulunamadı veya size ait değil.`);
        }

        if (sourceAccountType === 'BankAccount') {
          await prismaTx.bankAccount.update({
            where: { id: sourceAccountId },
            data: { balance: { decrement: amount } },
          });
        } else if (sourceAccountType === 'CreditCard') {
          await prismaTx.creditCard.update({
            where: { id: sourceAccountId },
            data: { currentDebt: { increment: amount } },
          });
        }
      }

      if (type === 'income' || type === 'transfer') {
        if (!destinationAccountId || !destinationAccountType) {
          throw new Error('Hedef hesap/kart bilgisi eksik olduğu için bakiye güncellenemedi.');
        }
        // Hedef hesabı/kartı bul ve kullanıcıya ait olduğunu tekrar doğrula
        const currentDestinationAccount = await (destinationAccountType === 'BankAccount' ? prismaTx.bankAccount.findUnique({ where: { id: destinationAccountId, userId: req.userId } }) :
                                               destinationAccountType === 'CreditCard' ? prismaTx.creditCard.findUnique({ where: { id: destinationAccountId, userId: req.userId } }) :
                                               destinationAccountType === 'Loan' ? prismaTx.loan.findUnique({ where: { id: destinationAccountId, userId: req.userId } }) : null);

        if (!currentDestinationAccount) {
            throw new Error(`Hedef ${destinationAccountType} bulunamadı veya size ait değil.`);
        }

        if (destinationAccountType === 'BankAccount') {
          await prismaTx.bankAccount.update({
            where: { id: destinationAccountId },
            data: { balance: { increment: amount } },
          });
        } else if (destinationAccountType === 'CreditCard') {
          await prismaTx.creditCard.update({
            where: { id: destinationAccountId },
            data: { currentDebt: { decrement: amount } },
          });
        }
      }

      return updated;
    });

    res.json({ message: 'İşlem başarıyla güncellendi.', transaction: updatedTransaction });
  } catch (err) {
    console.error('İşlemi güncellerken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlem güncellenemedi.' });
  }
});


// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction by ID for the authenticated user
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    const transactionToDelete = await prisma.transaction.findUnique({
        where: { id: id, userId: req.userId },
        include: {
            sourceBankAccount: true,
            sourceCreditCard: true,
            sourceLoan: true,
            destinationBankAccount: true,
            destinationCreditCard: true,
            destinationLoan: true,
        },
    });

    if (!transactionToDelete) {
        return res.status(404).json({ message: 'Silinecek işlem bulunamadı veya size ait değil.' });
    }

    await prisma.$transaction(async (prismaTx) => {
        if (transactionToDelete.type === 'expense' || transactionToDelete.type === 'transfer') {
            if (transactionToDelete.sourceBankAccount) {
                await prismaTx.bankAccount.update({
                    where: { id: transactionToDelete.sourceBankAccount.id },
                    data: { balance: { increment: transactionToDelete.amount } },
                });
            } else if (transactionToDelete.sourceCreditCard) {
                await prismaTx.creditCard.update({
                    where: { id: transactionToDelete.sourceCreditCard.id },
                    data: { currentDebt: { decrement: transactionToDelete.amount } },
                });
            }
        }

        if (transactionToDelete.type === 'income' || transactionToDelete.type === 'transfer') {
            if (transactionToDelete.destinationBankAccount) {
                await prismaTx.bankAccount.update({
                    where: { id: transactionToDelete.destinationBankAccount.id },
                    data: { balance: { decrement: transactionToDelete.amount } },
                });
            } else if (transactionToDelete.destinationCreditCard) {
                await prismaTx.creditCard.update({
                    where: { id: transactionToDelete.destinationCreditCard.id },
                    data: { currentDebt: { increment: transactionToDelete.amount } },
                });
            }
        }

        await prismaTx.transaction.delete({
            where: { id: id },
        });
    });

    res.json({ message: 'İşlem başarıyla silindi ve bakiyeler güncellendi.' });
  } catch (err) {
    console.error('İşlemi silerken hata:', err.message);
    res.status(500).json({ message: err.message || 'Sunucu hatası: İşlem silinemedi.' });
  }
});


export default router;