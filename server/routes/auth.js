// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware'); // authMiddleware'i içe aktar

const prisma = new PrismaClient();
const router = express.Router();

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: { // Sadece belirli alanları döndür
        id: true,
        email: true,
        createdAt: true,
      }
    });

    res.status(201).json({ message: 'Kayıt başarılı.', user });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu.' });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya parola.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya parola.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token 1 saat geçerli olacak
    });

    res.status(200).json({
      message: 'Giriş başarılı.',
      token,
      user: { // Sadece güvenli ve gerekli bilgileri döndür
        id: user.id,
        email: user.email,
        firstName: user.firstName, // Yeni eklenen: Dashboard için
      },
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
  }
});

// Kullanıcı profil bilgilerini getir (Sadece kendi profili)
// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  const userId = req.userId; // authMiddleware'den gelen kullanıcı ID'si

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Sadece belirli alanları döndür
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phoneNumber: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: 'Profil bilgileri getirilirken bir hata oluştu.' });
  }
});

// Kullanıcı profil bilgilerini güncelle (Sadece kendi profili)
// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  const userId = req.userId; // authMiddleware'den gelen kullanıcı ID'si
  const { firstName, lastName, dateOfBirth, phoneNumber } = req.body;

  try {
    // Telefon numarasının benzersizlik kontrolü (eğer gönderildiyse ve mevcut kullanıcının kendi numarası değilse)
    if (phoneNumber) {
      const existingUserWithPhone = await prisma.user.findUnique({ where: { phoneNumber } });
      if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
        return res.status(400).json({ message: 'Bu telefon numarası zaten başka bir hesaba kayıtlı.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, // Eğer dateOfBirth boşsa güncelleme yapma
        phoneNumber,
        updatedAt: new Date(), // updatedAt alanını manuel güncelle
      },
      select: { // Güncellenmiş sadece belirli alanları döndür
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.status(200).json({ message: 'Profil başarıyla güncellendi.', user: updatedUser });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu.' });
  }
});

module.exports = router;