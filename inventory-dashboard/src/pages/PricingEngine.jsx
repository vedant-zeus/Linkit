import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, CheckCircle2, RefreshCw } from 'lucide-react';
import client from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, LineChart, Line, ReferenceLine
} from 'recharts';

const fmt  = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const fmtC = (n) => `₹${fmt(n)}`;

/* ── Score bar with color gradient ── */
function ScoreBar({ label, score, description }) {
  // score is -1 to +1; display as 0–100%
  const pct    = Math.round(((score + 1) / 2) * 100);
  const color  = pct >= 60 ? '#16A34A' : pct >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          {description && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{description}</span>}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 40, textAlign: 'right' }}>
          {pct}%
        </span>
      </div>
      <div className="score-bar-track">
        <motion.div
          className="score-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

/* ── Custom Tooltip for profit chart ── */
function ProfitTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Price: {fmtC(d.price)}</div>
      <div style={{ color: '#64748B' }}>Demand: {d.predictedDemand} units</div>
      <div style={{ color: '#16A34A', fontWeight: 600 }}>Profit: {fmtC(d.profit)}</div>
    </div>
  );
}

export default function PricingEngine() {
  const [products, setProducts]   = useState([]);
  const [selId,    setSelId]      = useState('');
  const [result,   setResult]     = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [applying, setApplying]   = useState(false);
  const [applied,  setApplied]    = useState(false);
  const [history,  setHistory]    = useState([]);

  useEffect(() => {
    client.get('/products').then(r => {
      setProducts(r.data);
      if (r.data.length > 0) setSelId(String(r.data[0].product_id));
    });
    client.get('/pricing/history').then(r => setHistory(r.data.slice(0, 8)));
  }, []);

  useEffect(() => {
    if (selId) runEngine();
  }, [selId]);

  const runEngine = async () => {
    setLoading(true);
    setResult(null);
    setApplied(false);
    try {
      const { data } = await client.get(`/pricing/recommendation/${selId}`);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyPrice = async () => {
    if (!result) return;
    setApplying(true);
    try {
      await client.post(`/pricing/apply/${selId}`, {
        newPrice: result.recommendation.price,
        reason: result.recommendation.reason,
      });
      setApplied(true);
      // Refresh history
      client.get('/pricing/history').then(r => setHistory(r.data.slice(0, 8)));
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(false);
    }
  };

  const pctChange = result?.recommendation?.pctChange || 0;
  const isUp      = pctChange >= 0;

  // Build price-history sparkline from product's price_history
  const [priceHist, setPriceHist] = useState([]);
  useEffect(() => {
    if (selId) {
      client.get(`/products/${selId}/price-history`).then(r => {
        const d = r.data.reverse().map(h => ({
          date:  new Date(h.timestamp).toLocaleDateString('en-IN', { month:'short', day:'numeric' }),
          price: +h.new_price,
        }));
        setPriceHist(d);
      });
    }
  }, [selId, applied]);

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
          }}>
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
              Pricing <span>Engine</span>
            </h1>
            <p style={{ fontSize: 13, marginTop: 2 }}>Dynamic price optimization powered by market signals</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {/* Product selector */}
          <select
            className="input"
            style={{ minWidth: 240 }}
            value={selId}
            onChange={e => setSelId(e.target.value)}
          >
            {products.map(p => (
              <option key={p.product_id} value={p.product_id}>{p.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={runEngine} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            key={selId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* ── RECOMMENDATION BANNER ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: 24,
              padding: '32px 36px',
              marginBottom: 24,
              border: '1px solid #334155',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', top: -80, right: -80,
                width: 300, height: 300,
                background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                {/* Product + prices */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#22C55E', textTransform: 'uppercase', marginBottom: 8 }}>
                    Recommendation
                  </p>
                  <h2 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: 20, fontWeight: 700 }}>
                    {result.product.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Current Price</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#94A3B8', fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.03em' }}>
                        {fmtC(result.product.currentPrice)}
                      </div>
                    </div>
                    <div style={{ fontSize: 28, color: '#334155', fontWeight: 300 }}>→</div>
                    <div>
                      <div style={{ fontSize: 11, color: '#22C55E', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended</div>
                      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {fmtC(result.recommendation.price)}
                        <span style={{
                          fontSize: 15, fontWeight: 700,
                          color: isUp ? '#22C55E' : '#F87171',
                          background: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)',
                          padding: '4px 10px', borderRadius: 99,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isUp ? '+' : ''}{pctChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats column */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Predicted Demand', value: `${result.recommendation.predictedDemand} units/wk` },
                    { label: 'Expected Profit',  value: fmtC(result.recommendation.predictedProfit) },
                    { label: 'Competitor Avg',   value: result.market.competitorAvg ? fmtC(result.market.competitorAvg) : 'N/A' },
                    { label: 'Elasticity',        value: result.market.elasticity ? result.market.elasticity : 'N/A' },
                  ].map(s => (
                    <div key={s.label} style={{ minWidth: 110 }}>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Apply button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  {applied ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E', fontWeight: 700, fontSize: 15 }}
                    >
                      <CheckCircle2 size={22} /> Price Applied!
                    </motion.div>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={applyPrice}
                      disabled={applying}
                      style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 20px rgba(22,163,74,0.5)' }}
                    >
                      <Zap size={16} />
                      {applying ? 'Applying…' : 'Apply Price'}
                    </button>
                  )}
                  <p style={{ fontSize: 11, color: '#64748B', maxWidth: 200, textAlign: 'right' }}>
                    {result.recommendation.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* ── TWO COLUMN BODY ── */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
              {/* Score breakdown */}
              <div className="card">
                <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📊 Score Breakdown
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>(each -1 → +1, shown as %)</span>
                </h3>
                <ScoreBar label="Demand"    score={result.scores.demand}    description={`${result.demand.recentSales} units last 7d`} />
                <ScoreBar label="Inventory" score={result.scores.inventory} description={`${result.product.stock} units in stock`} />
                <ScoreBar label="Market"    score={result.scores.market}    description={result.market.competitorAvg ? `Avg comp: ${fmtC(result.market.competitorAvg)}` : ''} />
                <ScoreBar label="Behavior"  score={result.scores.behavior}  description="Purchase frequency & repeat rate" />
                <ScoreBar label="Seasonal"  score={result.scores.seasonal}  description="Month & day-of-week pattern" />

                <div style={{
                  marginTop: 20,
                  padding: '14px 16px',
                  background: 'var(--bg-base)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Weighted Score</span>
                  <span style={{
                    fontSize: 16, fontWeight: 800,
                    color: result.scores.weighted >= 0 ? '#16A34A' : '#EF4444',
                  }}>
                    {result.scores.weighted > 0 ? '+' : ''}{result.scores.weighted.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Profit optimization table */}
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>💹 Profit Optimization Curve</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={result.profitCurve} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <XAxis dataKey="price" tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ProfitTooltip />} />
                    <Bar dataKey="profit" radius={[5,5,0,0]}>
                      {result.profitCurve.map((entry, i) => {
                        const isOpt = entry.price === result.profitCurve.reduce((b,c) => c.profit > b.profit ? c : b, result.profitCurve[0]).price;
                        return <Cell key={i} fill={isOpt ? '#16A34A' : '#DCFCE7'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Table */}
                <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 14 }}>
                  <table style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Price</th>
                        <th>Demand (units)</th>
                        <th>Profit</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.profitCurve.map((row, i) => {
                        const maxProfit = Math.max(...result.profitCurve.map(r => r.profit));
                        const isOpt = row.profit === maxProfit;
                        return (
                          <tr key={i} style={{ background: isOpt ? '#F0FDF4' : undefined }}>
                            <td style={{ fontWeight: isOpt ? 700 : 400, color: isOpt ? '#16A34A' : undefined }}>
                              {fmtC(row.price)}
                            </td>
                            <td>{row.predictedDemand}</td>
                            <td style={{ fontWeight: isOpt ? 700 : 400, color: isOpt ? '#16A34A' : undefined }}>
                              {fmtC(row.profit)}
                            </td>
                            <td>{isOpt && <span className="badge badge-green">★ Optimal</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Price history sparkline */}
            {priceHist.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 20 }}>📈 Price History</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={priceHist} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickFormatter={v => `₹${(v/1000).toFixed(1)}k`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={v => [fmtC(v), 'Price']}
                      contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
                    />
                    <ReferenceLine y={result.recommendation.price} stroke="#16A34A" strokeDasharray="4 3" label={{ value: 'Recommended', fontSize: 10, fill: '#16A34A', position: 'insideTopRight' }} />
                    <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation History */}
      {history.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🕒 Recent Recommendations</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Recommended</th>
                  <th>Demand Score</th>
                  <th>Predicted Profit</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.recommendation_id}>
                    <td style={{ fontWeight: 600 }}>{h.product_name}</td>
                    <td style={{ fontWeight: 700, color: '#16A34A' }}>{fmtC(h.recommended_price)}</td>
                    <td>{(h.demand_score * 100).toFixed(0)}%</td>
                    <td>{fmtC(h.predicted_profit)}</td>
                    <td>
                      <span className={`badge ${h.applied ? 'badge-green' : 'badge-gray'}`}>
                        {h.applied ? 'Applied' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(h.timestamp).toLocaleString('en-IN', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
