const express = require('express');
const db      = require('../db/connection');
const router  = express.Router();

// GET /api/products — list all
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `
      SELECT p.*,
        COALESCE((SELECT AVG(competitor_price) FROM market_data m
                  WHERE m.product_id = p.product_id
                  ORDER BY m.timestamp DESC LIMIT 5), NULL) as competitor_avg,
        COALESCE((SELECT SUM(quantity) FROM transactions t
                  WHERE t.product_id = p.product_id
                    AND t.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)), 0) as sales_7d
      FROM products p
      WHERE 1=1
    `;
    const params = [];
    if (category) { sql += ' AND p.category = ?'; params.push(category); }
    if (search)   { sql += ' AND p.name LIKE ?';  params.push(`%${search}%`); }
    sql += ' ORDER BY p.product_id';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/categories — unique categories
router.get('/categories', async (req, res) => {
  const [rows] = await db.query('SELECT DISTINCT category FROM products ORDER BY category');
  res.json(rows.map(r => r.category));
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE product_id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id/price-history
router.get('/:id/price-history', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM price_history WHERE product_id = ? ORDER BY timestamp DESC LIMIT 20`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products/:id/view — record a view
router.post('/:id/view', async (req, res) => {
  try {
    const { user_id } = req.body;
    await db.query(
      'INSERT INTO product_views (user_id, product_id) VALUES (?, ?)',
      [user_id || null, req.params.id]
    );
    await db.query(
      'UPDATE products SET views = views + 1 WHERE product_id = ?',
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
