import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import client from '../api/client';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ScatterChart, Scatter, CartesianGrid, Legend,
  PieChart, Pie
} from 'recharts';

const fmt  = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const fmtC = (n) => `₹${fmt(n)}`;

function KPI({ label, value, sub, color = '#16A34A', delay = 0 }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <p style={{ fontSize: 12, marginTop: 6, margin: 0 }}>{sub}</p>}
    </motion.div>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [sales,    setSales]    = useState([]);
  const [topProds, setTopProds] = useState([]);
  const [catRev,   setCatRev]   = useState([]);
  const [days,     setDays]     = useState(30);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/analytics/overview'),
      client.get(`/analytics/sales?days=${days}`),
      client.get('/analytics/top-products'),
      client.get('/analytics/category-revenue'),
    ]).then(([ov, sl, tp, cr]) => {
      setOverview(ov.data);
      setSales(sl.data);
      setTopProds(tp.data);
      setCatRev(cr.data);
    }).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  const revChange = overview?.revenue7dPrev > 0
    ? (((overview.revenue7d - overview.revenue7dPrev) / overview.revenue7dPrev) * 100).toFixed(1)
    : 0;

  const CAT_COLORS = ['#16A34A','#3B82F6','#8B5CF6','#F59E0B','#EF4444'];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>Business performance & pricing insights</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7,14,30].map(d => (
            <button key={d} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDays(d)}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <KPI label="Total Revenue"  value={fmtC(overview?.totalRevenue || 0)}  sub={`${revChange > 0 ? '+' : ''}${revChange}% vs prev week`} delay={0}    />
        <KPI label="Total Orders"   value={fmt(overview?.totalOrders || 0)}     sub="All time transactions"                                   delay={0.06}  />
        <KPI label="Products"       value={fmt(overview?.totalProducts || 0)}   sub="In catalogue"                                            delay={0.12}  />
        <KPI label="Low Stock"      value={fmt(overview?.lowStockCount || 0)}   sub="Need restocking"                                         color="#EF4444" delay={0.18} />
      </div>

      {/* Sales trend + Category pie */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>📈 Sales Trend — Last {days} Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sales} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v, name) => name === 'revenue' ? [fmtC(v), 'Revenue'] : [v, 'Units']}
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2} fill="url(#revGrad2)" dot={false} />
              <Area type="monotone" dataKey="units"   stroke="#3B82F6" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>🍕 Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={catRev}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
                label={({ category, percent }) => `${category} ${(percent*100).toFixed(0)}%`}
                labelLine={false}
              >
                {catRev.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => [fmtC(v), 'Revenue']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>🏆 Top Products by Revenue</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topProds} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151' }} width={180} />
            <Tooltip formatter={v => [fmtC(v), 'Revenue']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
              {topProds.map((_, i) => <Cell key={i} fill={i === 0 ? '#16A34A' : '#86EFAC'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights callout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { icon: '📦', title: 'Stock Risk', text: `${overview?.lowStockCount || 0} products below reorder threshold`, color: '#FEF3C7', border: '#FDE68A' },
          { icon: '💹', title: 'Revenue Trend', text: `${+revChange >= 0 ? '↑' : '↓'} ${Math.abs(revChange)}% revenue vs previous week`, color: '#F0FDF4', border: '#BBF7D0' },
          { icon: '🧠', title: 'Pricing Engine', text: 'Run the Pricing Engine to get AI-powered price recommendations', color: '#EFF6FF', border: '#BFDBFE' },
        ].map(c => (
          <div key={c.title} style={{ background: c.color, border: `1px solid ${c.border}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{c.title}</div>
            <p style={{ fontSize: 13, margin: 0 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
