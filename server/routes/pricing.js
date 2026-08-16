const express = require('express');
const db      = require('../db/connection');
const { runPricingEngine } = require('../engine/pricingEngine');
const router  = express.Router();

// GET /api/pricing/recommendation/:id — run engine for one product
router.get('/recommendation/:id', async (req, res) => {
  try {
    const result = await runPricingEngine(parseInt(req.params.id));

    // Save recommendation to DB
    await db.query(
      `INSERT INTO pricing_recommendations
         (product_id, recommended_price, demand_score, inventory_score,
          market_score, behavior_score, seasonal_score, weighted_score,
          predicted_demand, predicted_profit)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        req.params.id,
        result.recommendation.price,
        result.scores.demand,
        result.scores.inventory,
        result.scores.market,
        result.scores.behavior,
        result.scores.seasonal,
        result.scores.weighted,
        result.recommendation.predictedDemand,
        result.recommendation.predictedProfit,
      ]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Pricing engine error' });
  }
});

// POST /api/pricing/apply/:id — apply recommended price
router.post('/apply/:id', async (req, res) => {
  const { newPrice, reason, recommendation_id } = req.body;
  if (!newPrice) return res.status(400).json({ error: 'newPrice required' });

  try {
    // Get current price
    const [[product]] = await db.query(
      'SELECT current_price FROM products WHERE product_id = ?', [req.params.id]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const oldPrice = product.current_price;

    // Update product price
    await db.query(
      'UPDATE products SET current_price = ? WHERE product_id = ?',
      [newPrice, req.params.id]
    );

    // Log price history
    await db.query(
      `INSERT INTO price_history (product_id, old_price, new_price, reason)
       VALUES (?,?,?,?)`,
      [req.params.id, oldPrice, newPrice, reason || 'Pricing engine recommendation']
    );

    // Mark recommendation as applied
    if (recommendation_id) {
      await db.query(
        'UPDATE pricing_recommendations SET applied = TRUE WHERE recommendation_id = ?',
        [recommendation_id]
      );
    }

    res.json({ ok: true, oldPrice, newPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/pricing/history — all past recommendations
router.get('/history', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pr.*, p.name as product_name, p.category
       FROM pricing_recommendations pr
       JOIN products p ON p.product_id = pr.product_id
       ORDER BY pr.timestamp DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/pricing/all-recommendations — run engine for ALL products
router.get('/all-recommendations', async (req, res) => {
  try {
    const [products] = await db.query('SELECT product_id FROM products');
    const results = await Promise.all(
      products.map(p => runPricingEngine(p.product_id).catch(e => null))
    );
    res.json(results.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
