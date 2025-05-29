// server/server.js

// CommonJS 'require' yerine ES Modülü 'import' kullanıyoruz
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'; // PrismaClient'ı doğru şekilde import et
import { Router } from 'express'; // Express.Router için Router'ı import et

// Rotaları içe aktar (şimdi ES Modülü import syntax'ı ve .js uzantısı ile)
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import creditCardRoutes from './routes/creditCardRoutes.js';
import bankAccountRoutes from './routes/bankAccountRoutes.js';
// Loan ve Investment rotaları da varsa, onları da buraya eklemelisiniz:
// import loanRoutes from './routes/loanRoutes.js';
// import investmentRoutes from 'routes/investmentRoutes.js';


// .env dosyasını yükle
dotenv.config();

// PrismaClient'ı başlat
const prisma = new PrismaClient();

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