// server.js / app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './models/db.js';
import authRoutes from './routes/auth.js';
import wisataRoutes from './routes/wisataRoutes.js';
import berandaRoutes from './routes/berandaRoutes.js';
import lawaRoutes from "./routes/lawaRoutes.js";
import baluaraRoutes from "./routes/baluaraRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file access (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// PostgreSQL connection test
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ Failed to connect to PostgreSQL:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wisata', wisataRoutes);
app.use('/api/beranda', berandaRoutes);
app.use("/api/lawa", lawaRoutes);
app.use("/api/baluara", baluaraRoutes);


// Test Route
app.get('/', (req, res) => {
  res.send('🚀 Backend is running...');
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ server_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
