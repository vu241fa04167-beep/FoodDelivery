import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback

import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in .env');
}

const app = express();
const port = process.env.PORT || 5000;
const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(x => x.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origins.includes(origin) || origin.startsWith('http://localhost:')) {
      return cb(null, true);
    }
    cb(null, true); // Dev-friendly permissive
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'savor-backend', timestamp: new Date() }));
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.url} not found` }));
app.use(errorHandler);

const socketPath = '/tmp/savor.sock';

connectDB().then(() => {
  // 1. TCP Server for standard browser access
  const tcpServer = app.listen(port, () => {
    console.log(`🚀 Savor API running on http://localhost:${port}`);
  });
  tcpServer.on('error', (err) => {
    console.warn(`TCP listen on port ${port} warning:`, err.message);
  });

  // 2. Unix Domain Socket server for fast sandboxed access
  try {
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
    }
    const sockServer = http.createServer(app);
    sockServer.listen(socketPath, () => {
      console.log(`🔌 Savor Socket API listening on ${socketPath}`);
      try {
        fs.chmodSync(socketPath, '0777');
      } catch (e) {}
    });
  } catch (err) {
    console.warn('Socket server creation warning:', err.message);
  }
}).catch(err => {
  console.error('Fatal: Database connection failed:', err.message);
  process.exit(1);
});

export default app;
