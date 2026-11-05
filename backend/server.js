import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

// Connect to MongoDB
connectDB();

const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://food-delivery-ni4v.vercel.app',
  'https://food-delivery-nine-liard.vercel.app'
];
app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowed = !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (process.env.CLIENT_URL && process.env.CLIENT_URL.replace(/\/$/, '') === origin.replace(/\/$/, ''));
      callback(null, !!isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);
app.use(express.json({ limit: '100kb' }));

// Reject MongoDB operator injection before any controller can use request data.
const hasUnsafeKey = (value) => {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, nested]) => (
    key.startsWith('$') || key.includes('.') || hasUnsafeKey(nested)
  ));
};
app.use((req, res, next) => {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }
  next();
});

// Root and Health check routes
app.get('/', (req, res) => {
  res.json({ message: 'QuickBite API running', status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'quickbite-backend',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// Fallback mounts without /api prefix for compatibility
app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/coupons', couponRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
