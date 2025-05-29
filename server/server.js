// server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rotaları içe aktar
// auth.js'in içindeki rotalar authRoutes olarak adlandırıldı
const authRoutes = require('./routes/auth');
// transactions.js'in içindeki rotalar transactionRoutes olarak adlandırıldı
const transactionRoutes = require('./routes/transactions');
// creditCardRoutes.js'in içindeki rotalar creditCardRoutes olarak adlandırıldı
const creditCardRoutes = require('./routes/creditCardRoutes'); 
// Loan ve Investment rotaları da varsa, onları da buraya eklemelisiniz:
// const loanRoutes = require('./routes/loanRoutes');
// const investmentRoutes = require('./routes/investmentRoutes');


// .env dosyasını yükle
dotenv.config();

// Express uygulamasını başlat
const app = express();

// Middleware'leri kullan
app.use(cors());
app.use(express.json());

// Basit bir API endpoint'i (test amaçlı)
app.get('/', (req, res) => {
  res.send('NFinance Backend API is running!');
});

// Auth rotalarını dahil et
app.use('/api/auth', authRoutes);
// İşlem (Transaction) rotalarını dahil et (tek ve doğru kullanım)
app.use('/api/transactions', transactionRoutes);
// Kredi kartı rotalarını dahil et
app.use('/api/creditcards', creditCardRoutes);
app.use('/api/bankaccounts', bankAccountRoutes);
// Loan ve Investment rotaları da varsa, onları da buraya dahil etmelisiniz:
// app.use('/api/loans', loanRoutes);
// app.use('/api/investments', investmentRoutes);


// Sunucu portunu tanımla
const PORT = process.env.PORT || 5000;

// Sunucuyu belirli bir portta dinlemeye başla
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Sunucu kapatıldığında (Ctrl+C gibi) Prisma bağlantısını düzgün bir şekilde kapat
process.on('SIGINT', async () => {
  console.log('Server shutting down. Disconnecting Prisma...');
  await prisma.$disconnect();
  console.log('Prisma disconnected.');
  process.exit(0); // Başarılı çıkış kodu
});

// Uygulama kapatıldığında (örneğin program çökmesi) Prisma bağlantısını kapat
process.on('unhandledRejection', async (err) => {
  console.error('Unhandled Rejection:', err);
  await prisma.$disconnect();
  process.exit(1); // Hatalı çıkış kodu
});