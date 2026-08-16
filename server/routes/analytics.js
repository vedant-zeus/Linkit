const express = require('express');
const db      = require('../db/connection');
const router  = express.Router();

// GET /api/analytics/overview — dashboard KPIs
router.get('/overview', async (req, res) => {
  try {
    const [[revRow]]      = await db.query(`SELECT COALESCE(SUM(t.price * t.quantity), 0) as total_revenue FROM transactions t`);
    const [[ordRow]]      = await db.query(`SELECT COUNT(*) as total_orders FROM transactions`);
    const [[prodRow]]     = await db.query(`SELECT COUNT(*) as total_products FROM products`);
    const [[lowRow]]      = await db.query(`SELECT COUNT(*) as low_stock FROM products WHERE stock <= reorder_point`);
    const [[rev7Row]]     = await db.query(`SELECT COALESCE(SUM(price * quantity), 0) as revenue_7d FROM transactions WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    const [[rev7PrevRow]] = await db.query(`SELECT COALESCE(SUM(price * quantity), 0) as revenue_7d_prev FROM transactions WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY)`);

    res.json({
      totalRevenue:   +revRow.total_revenue,
      totalOrders:    +ordRow.total_orders,
      totalProducts:  +prodRow.total_products,
      lowStockCount:  +lowRow.low_stock,
      revenue7d:      +rev7Row.revenue_7d,
      revenue7dPrev:  +rev7PrevRow.revenue_7d_prev,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/sales — time-series for last N days
router.get('/sales', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const [rows] = await db.query(
      `SELECT
         DATE(timestamp) as date,
         SUM(quantity)   as units,
         SUM(price * quantity) as revenue
       FROM transactions
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`,
      [days]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/top-products — by revenue
router.get('/top-products', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.name, p.category, p.current_price,
              SUM(t.quantity) as units_sold,
              SUM(t.price * t.quantity) as revenue
       FROM transactions t
       JOIN products p ON p.product_id = t.product_id
       GROUP BY t.product_id
       ORDER BY revenue DESC
       LIMIT 8`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/elasticity/:id — price vs demand scatter
router.get('/elasticity/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT price, SUM(quantity) as demand
       FROM transactions
       WHERE product_id = ?
       GROUP BY price
       ORDER BY price ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/category-revenue
router.get('/category-revenue', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.category,
              SUM(t.price * t.quantity) as revenue,
              SUM(t.quantity) as units
       FROM transactions t
       JOIN products p ON p.product_id = t.product_id
       GROUP BY p.category
       ORDER BY revenue DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
