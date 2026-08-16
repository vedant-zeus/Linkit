import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  AlertTriangle, DollarSign, ArrowRight, ShoppingBag
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const fmtCurrency = (n) => `₹${fmt(n)}`;

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

/* ─── ADMIN DASHBOARD ─── */
function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [sales,    setSales]    = useState([]);
  const [topProds, setTopProds] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/analytics/overview'),
      client.get('/analytics/sales?days=14'),
      client.get('/analytics/top-products'),
    ]).then(([ov, sl, tp]) => {
      setOverview(ov.data);
      setSales(sl.data);
      setTopProds(tp.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  const revChange = overview?.revenue7dPrev > 0
    ? (((overview.revenue7d - overview.revenue7dPrev) / overview.revenue7dPrev) * 100).toFixed(1)
    : 0;

  const kpis = [
    {
      label: 'Total Revenue',
      value: fmtCurrency(overview?.totalRevenue || 0),
      icon: DollarSign,
      color: '#16A34A',
      bg: '#F0FDF4',
      sub: `${revChange > 0 ? '+' : ''}${revChange}% vs last week`,
      up: revChange >= 0,
    },
    {
      label: 'Total Orders',
      value: fmt(overview?.totalOrders || 0),
      icon: ShoppingCart,
      color: '#3B82F6',
      bg: '#EFF6FF',
      sub: 'All time',
    },
    {
      label: 'Active Products',
      value: fmt(overview?.totalProducts || 0),
      icon: Package,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      sub: 'In catalogue',
    },
    {
      label: 'Low Stock',
      value: fmt(overview?.lowStockCount || 0),
      icon: AlertTriangle,
      color: overview?.lowStockCount > 2 ? '#EF4444' : '#F59E0B',
      bg: overview?.lowStockCount > 2 ? '#FEF2F2' : '#FFFBEB',
      sub: 'Need restocking',
      danger: overview?.lowStockCount > 2,
    },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            link<span>it</span>
          </h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>Business Performance Console (Admin)</p>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
          color: '#16A34A', textTransform: 'uppercase',
          background: '#F0FDF4', padding: '6px 14px',
          borderRadius: 99, border: '1px solid #DCFCE7',
        }}>
          ● Active Mode
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="card"
            style={{ border: kpi.danger ? '1px solid #FECACA' : undefined }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {kpi.label}
              </span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: kpi.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: kpi.danger ? '#EF4444' : 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {kpi.value}
            </div>
            {kpi.sub && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {kpi.up !== undefined && (kpi.up
                  ? <TrendingUp size={12} style={{ color: '#16A34A' }} />
                  : <TrendingDown size={12} style={{ color: '#EF4444' }} />
                )}
                {kpi.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Revenue — Last 14 Days</h3>
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sales} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [fmtCurrency(v), 'Revenue']}
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No sales data yet</div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Top Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProds.slice(0, 5).map((p, i) => {
              const maxRev = topProds[0]?.revenue || 1;
              const pct = (p.revenue / maxRev) * 100;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: 500, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{ fontWeight: 700, color: '#16A34A' }}>{fmtCurrency(p.revenue)}</span>
                  </div>
                  <div className="score-bar-track">
                    <motion.div
                      className="score-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.07, duration: 0.6 }}
                      style={{ background: i === 0 ? '#16A34A' : '#86EFAC' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── USER DASHBOARD ─── */
function UserDashboard() {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      client.get(`/transactions?user_id=${user.id}&limit=5`),
      client.get('/products?limit=3'),
    ]).then(([txnRes, prodRes]) => {
      setMyOrders(txnRes.data.transactions);
      setFeatured(prodRes.data.slice(0, 3));
    }).catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + (i.current_price || i.price) * i.quantity, 0);

  return (
    <div className="fade-up">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
        borderRadius: 24,
        padding: '36px 40px',
        color: '#FFFFFF',
        marginBottom: 32,
        boxShadow: '0 12px 32px rgba(22,163,74,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: 8, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Hello, {user.name}!
        </h1>
        <p style={{ color: '#DCFCE7', fontSize: 15, maxWidth: 460, margin: 0, lineHeight: 1.6 }}>
          Welcome to your Linkit store catalog. Browse premium items, add them to your cart, and see live pricing changes matching demand!
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {/* Cart Quick Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart style={{ color: 'var(--brand-green)' }} size={20} /> Active Cart
            </h3>
            <p style={{ fontSize: 13, margin: 0 }}>
              You have <strong>{totalCartItems}</strong> items in your shopping cart.
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Subtotal:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Poppins', sans-serif" }}>
                {fmtCurrency(cartTotal)}
              </span>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Shop More Products <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Catalog Highlights */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gridColumn: 'span 2' }}>
          <div>
            <h3 style={{ marginBottom: 14 }}>✨ Featured Items</h3>
            <div style={{ display: 'flex', gap: 14 }}>
              {featured.map(p => (
                <div key={p.product_id} style={{
                  flex: 1,
                  background: 'var(--bg-base)',
                  borderRadius: 12,
                  padding: 12,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-green)' }}>
                      {fmtCurrency(p.current_price)}
                    </span>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', background: '#E2E8F0', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                      {p.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => navigate('/products')} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              View Catalog
            </button>
          </div>
        </div>
      </div>

      {/* My orders */}
      <div className="card">
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShoppingBag style={{ color: 'var(--brand-green)' }} size={20} /> My Recent Orders
        </h3>
        {myOrders.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, padding: '20px 0', textAlign: 'center' }}>
            You haven't placed any orders yet. Browse our catalog to buy products!
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price Paid</th>
                  <th>Total Amount</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map(t => (
                  <tr key={t.transaction_id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{t.transaction_id}</td>
                    <td style={{ fontWeight: 600 }}>{t.product_name}</td>
                    <td>{t.quantity}</td>
                    <td>{fmtCurrency(t.price)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-green)' }}>{fmtCurrency(t.price * t.quantity)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(t.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
