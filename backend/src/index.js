import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payment.js';
import razorpayRoutes from './routes/razorpay.js';
import gokwikRoutes from './routes/gokwik.js';
import { connectDatabase, disconnectDatabase, default as prisma } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://127.0.0.1:4200', 'http://127.0.0.1:4201'],
  credentials: true,
}));

app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/gokwik', gokwikRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

startServer();

export default app;
