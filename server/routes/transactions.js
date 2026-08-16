const express = require('express');
const db      = require('../db/connection');
const router  = express.Router();

// GET /api/transactions — recent transactions
router.get('/', async (req, res) => {
  const limit  = parseInt(req.query.limit)  || 50;
  const offset = parseInt(req.query.offset) || 0;
  const productId = req.query.product_id;
  const userId = req.query.user_id;

  try {
    let sql = `
      SELECT t.*, p.name as product_name, p.category,
             u.name as customer_name
      FROM transactions t
      JOIN products p ON p.product_id = t.product_id
      LEFT JOIN users u ON u.user_id = t.user_id
      WHERE 1=1
    `;
    const params = [];
    if (productId) { sql += ' AND t.product_id = ?'; params.push(productId); }
    if (userId)    { sql += ' AND t.user_id = ?';    params.push(userId); }
    sql += ' ORDER BY t.timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM transactions WHERE 1=1';
    const countParams = [];
    if (productId) { countSql += ' AND product_id = ?'; countParams.push(productId); }
    if (userId)    { countSql += ' AND user_id = ?';    countParams.push(userId); }
    const [[{ total }]] = await db.query(countSql, countParams);

    res.json({ transactions: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/transactions — record a sale
router.post('/', async (req, res) => {
  const { user_id, product_id, quantity, price } = req.body;
  if (!product_id || !quantity || !price)
    return res.status(400).json({ error: 'product_id, quantity, and price required' });

  try {
    // Check stock
    const [[product]] = await db.query(
      'SELECT stock FROM products WHERE product_id = ?', [product_id]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity)
      return res.status(400).json({ error: 'Insufficient stock' });

    // Insert transaction
    const [result] = await db.query(
      'INSERT INTO transactions (user_id, product_id, quantity, price) VALUES (?,?,?,?)',
      [user_id || null, product_id, quantity, price]
    );

    // Deduct stock
    await db.query(
      'UPDATE products SET stock = stock - ? WHERE product_id = ?',
      [quantity, product_id]
    );

    res.json({ transaction_id: result.insertId, ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
