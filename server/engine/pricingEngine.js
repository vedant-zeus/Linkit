/**
 * ============================================================
 *  LINKIT — Dynamic Pricing Engine
 *  Stage 1: Rule-based weighted scoring + profit optimization
 * ============================================================
 */

const db = require('../db/connection');

// ─── Clamp helper ───────────────────────────────────────────
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// ─── Normalize a value to [-1, +1] ──────────────────────────
const normalize = (value, min, max) => {
  if (max === min) return 0;
  return clamp(((value - min) / (max - min)) * 2 - 1, -1, 1);
};

// ─── Round to nearest "psychological" price ─────────────────
const psychPrice = (price) => {
  if (price <= 0) return price;
  const rounded = Math.round(price / 10) * 10;
  return rounded - 1; // e.g. 5000 → 4999
};

/**
 * Calculate Demand Score (-1 to +1)
 * Based on: sales velocity, demand trend, conversion rate
 */
async function calcDemandScore(productId, currentPrice) {
  // Sales in last 7 days vs 7 days before that
  const [recentRows] = await db.query(
    `SELECT COALESCE(SUM(quantity), 0) as qty
     FROM transactions
     WHERE product_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [productId]
  );
  const [prevRows] = await db.query(
    `SELECT COALESCE(SUM(quantity), 0) as qty
     FROM transactions
     WHERE product_id = ?
       AND timestamp >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       AND timestamp <  DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [productId]
  );

  const recentSales = recentRows[0].qty;
  const prevSales   = prevRows[0].qty;

  // Conversion rate: sales / views (last 14 days)
  const [viewRows] = await db.query(
    `SELECT COUNT(*) as views FROM product_views
     WHERE product_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 14 DAY)`,
    [productId]
  );
  const views = viewRows[0].views || 1;
  const totalSales = recentSales + prevSales;
  const conversionRate = Math.min(totalSales / views, 1);

  // Demand trend: ratio of recent to previous
  let trendScore = 0;
  if (prevSales > 0) {
    const ratio = recentSales / prevSales; // 1 = stable, >1 = growing
    trendScore = normalize(ratio, 0.5, 2.0); // 0.5x = poor, 2x = great
  } else if (recentSales > 0) {
    trendScore = 0.5; // new demand
  }

  // Velocity score: absolute sales volume
  const velocityScore = normalize(recentSales, 0, 30); // 30+ units/week = max

  const convScore = normalize(conversionRate, 0, 0.15); // 15%+ conv = great

  const demandScore = clamp(
    0.5 * trendScore + 0.3 * velocityScore + 0.2 * convScore,
    -1, 1
  );

  return {
    score: demandScore,
    recentSales,
    prevSales,
    conversionRate: +(conversionRate * 100).toFixed(1),
  };
}

/**
 * Calculate Inventory Score (-1 to +1)
 * Low stock → high score (push price up); excess → negative (push down)
 */
async function calcInventoryScore(productId) {
  const [rows] = await db.query(
    `SELECT stock, reorder_point FROM products WHERE product_id = ?`,
    [productId]
  );
  const { stock, reorder_point: reorderPoint } = rows[0];

  // Ideal stock ~3x reorder point; below reorder = scarce
  const ratio = stock / (reorderPoint * 3); // 0 = empty, 1 = ideal, >1 = excess
  // We want: low stock = positive score (increase price)
  const score = normalize(1 - ratio, -1, 1); // invert: scarcity = positive

  return { score: clamp(score, -1, 1), stock, reorderPoint };
}

/**
 * Calculate Market Score (-1 to +1)
 * vs average competitor price
 */
async function calcMarketScore(productId, currentPrice) {
  const [rows] = await db.query(
    `SELECT AVG(competitor_price) as avg_competitor
     FROM market_data
     WHERE product_id = ?
       AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [productId]
  );
  const competitorAvg = rows[0].avg_competitor;
  if (!competitorAvg) return { score: 0, competitorAvg: null };

  const compAvgNum = parseFloat(competitorAvg);
  // If competitor is higher → our price can go up → positive score
  const priceDiff = (compAvgNum - currentPrice) / currentPrice; // % diff
  const score = normalize(priceDiff, -0.2, 0.2); // ±20% range

  return {
    score: clamp(score, -1, 1),
    competitorAvg: +compAvgNum.toFixed(2),
  };
}

/**
 * Calculate Behavior Score (-1 to +1)
 * Based on: purchase frequency, repeat customers, avg order quantity
 */
async function calcBehaviorScore(productId) {
  const [freqRows] = await db.query(
    `SELECT
       COUNT(DISTINCT user_id)                         as unique_buyers,
       COUNT(*)                                        as total_orders,
       COALESCE(AVG(quantity), 1)                      as avg_qty
     FROM transactions
     WHERE product_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [productId]
  );

  const { unique_buyers, total_orders, avg_qty } = freqRows[0];

  // Repeat purchase rate
  const repeatRate = unique_buyers > 0
    ? (total_orders - unique_buyers) / unique_buyers
    : 0;

  const freqScore   = normalize(total_orders, 0, 20);  // 20+ orders/month = max
  const repeatScore = normalize(repeatRate, 0, 0.5);   // 50% repeat rate = max
  const qtyScore    = normalize(avg_qty, 1, 3);         // avg 3+ units = max

  const score = clamp(
    0.5 * freqScore + 0.3 * repeatScore + 0.2 * qtyScore,
    -1, 1
  );

  return { score, uniqueBuyers: unique_buyers, totalOrders: total_orders };
}

/**
 * Calculate Seasonal Score (-1 to +1)
 * Simple: month/weekday pattern from historical data
 */
function calcSeasonalScore() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1–12
  const dayOfWeek = now.getDay();   // 0=Sun

  // Festival months (India): Oct=9, Nov=10, Dec=11, Jan=0 → high
  const festivalMonths = [9, 10, 11, 12, 1];
  const isFestival = festivalMonths.includes(month);

  // Weekend boost
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let score = 0;
  if (isFestival) score += 0.5;
  if (isWeekend)  score += 0.2;

  return { score: clamp(score, -1, 1) };
}

/**
 * Calculate Price Elasticity from historical data
 */
async function calcElasticity(productId) {
  const [rows] = await db.query(
    `SELECT price, SUM(quantity) as demand
     FROM transactions
     WHERE product_id = ?
     GROUP BY price
     ORDER BY price ASC`,
    [productId]
  );

  if (rows.length < 2) return null;

  // Simple point elasticity between min and max observed prices
  const low  = rows[0];
  const high = rows[rows.length - 1];

  const pctPriceChange  = (high.price - low.price) / low.price;
  const pctDemandChange = (low.demand - high.demand) / high.demand;

  if (pctPriceChange === 0) return null;
  return +(pctDemandChange / pctPriceChange).toFixed(2);
}

/**
 * Predict demand at a given candidate price using elasticity
 */
function predictDemand(baseDemand, basePrice, candidatePrice, elasticity) {
  if (!elasticity || elasticity === 0) return baseDemand;
  const pctChange = (candidatePrice - basePrice) / basePrice;
  const demandMultiplier = 1 + elasticity * pctChange;
  return Math.max(0, baseDemand * demandMultiplier);
}

/**
 * ─── MAIN PRICING ENGINE ────────────────────────────────────
 * @param {number} productId
 * @returns {object} full recommendation object
 */
async function runPricingEngine(productId) {
  // 1. Load product
  const [productRows] = await db.query(
    `SELECT * FROM products WHERE product_id = ?`, [productId]
  );
  if (!productRows.length) throw new Error('Product not found');
  const product = productRows[0];

  const currentPrice = parseFloat(product.current_price);
  const costPrice    = parseFloat(product.cost_price);
  const basePrice    = parseFloat(product.base_price);

  // 2. Compute all factor scores
  const [demandResult, inventoryResult, marketResult, behaviorResult, seasonResult] =
    await Promise.all([
      calcDemandScore(productId, currentPrice),
      calcInventoryScore(productId),
      calcMarketScore(productId, currentPrice),
      calcBehaviorScore(productId),
      Promise.resolve(calcSeasonalScore()),
    ]);

  const demandScore    = demandResult.score;
  const inventoryScore = inventoryResult.score;
  const marketScore    = marketResult.score;
  const behaviorScore  = behaviorResult.score;
  const seasonalScore  = seasonResult.score;

  // 3. Weighted pricing score
  const weightedScore =
    0.30 * demandScore    +
    0.20 * inventoryScore +
    0.20 * marketScore    +
    0.15 * behaviorScore  +
    0.15 * seasonalScore;

  // 4. Calculate adjusted price (max ±15%)
  const MAX_ADJ = 0.15;
  const adjustment = basePrice * weightedScore * MAX_ADJ;
  const adjustedPrice = clamp(
    basePrice + adjustment,
    basePrice * (1 - MAX_ADJ),
    basePrice * (1 + MAX_ADJ)
  );

  // 5. Profit optimization across 9 candidate prices
  const elasticity = await calcElasticity(productId);
  const baseDemand = demandResult.recentSales || 10; // units/week

  const minPrice = basePrice * 0.85;
  const maxPrice = basePrice * 1.15;
  const step     = (maxPrice - minPrice) / 8;

  const candidates = [];
  for (let i = 0; i <= 8; i++) {
    const candidatePrice = minPrice + step * i;
    const predictedDemand = predictDemand(baseDemand, currentPrice, candidatePrice, elasticity || -1.5);
    const profit = (candidatePrice - costPrice) * predictedDemand;
    candidates.push({
      price:           +candidatePrice.toFixed(2),
      predictedDemand: +predictedDemand.toFixed(1),
      profit:          +profit.toFixed(2),
    });
  }

  // Find optimal (max profit)
  const optimal = candidates.reduce((best, c) => c.profit > best.profit ? c : best, candidates[0]);

  // 6. Build recommendation reason
  const reasons = [];
  if (demandScore   > 0.4)  reasons.push('High demand');
  if (demandScore   < -0.3) reasons.push('Slowing demand');
  if (inventoryScore > 0.4) reasons.push('Low inventory');
  if (inventoryScore < -0.4)reasons.push('Excess inventory');
  if (marketScore   > 0.3)  reasons.push('Competitors priced higher');
  if (seasonalScore > 0.3)  reasons.push('Seasonal peak');

  const reason = reasons.length > 0
    ? reasons.join(', ')
    : 'Stable market conditions';

  const recommendedPrice = psychPrice(optimal.price);

  return {
    product: {
      id:           product.product_id,
      name:         product.name,
      category:     product.category,
      currentPrice: +currentPrice.toFixed(2),
      basePrice:    +basePrice.toFixed(2),
      costPrice:    +costPrice.toFixed(2),
      stock:        product.stock,
    },
    scores: {
      demand:    +demandScore.toFixed(3),
      inventory: +inventoryScore.toFixed(3),
      market:    +marketScore.toFixed(3),
      behavior:  +behaviorScore.toFixed(3),
      seasonal:  +seasonalScore.toFixed(3),
      weighted:  +weightedScore.toFixed(3),
    },
    market: {
      competitorAvg: marketResult.competitorAvg,
      elasticity,
    },
    demand: {
      recentSales:    demandResult.recentSales,
      prevSales:      demandResult.prevSales,
      conversionRate: demandResult.conversionRate,
    },
    recommendation: {
      price:           recommendedPrice,
      adjustedRaw:     +adjustedPrice.toFixed(2),
      pctChange:       +(((recommendedPrice - currentPrice) / currentPrice) * 100).toFixed(2),
      predictedDemand: optimal.predictedDemand,
      predictedProfit: +optimal.profit.toFixed(2),
      reason,
    },
    profitCurve: candidates,
  };
}

module.exports = { runPricingEngine };
