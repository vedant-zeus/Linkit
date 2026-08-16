require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes         = require('./routes/auth');
const productRoutes      = require('./routes/products');
const analyticsRoutes    = require('./routes/analytics');
const transactionRoutes  = require('./routes/transactions');
const pricingRoutes      = require('./routes/pricing');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/pricing',      pricingRoutes);

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Linkit Server running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Products: http://localhost:${PORT}/api/products`);
  console.log(`   Pricing: http://localhost:${PORT}/api/pricing/recommendation/1\n`);
});
