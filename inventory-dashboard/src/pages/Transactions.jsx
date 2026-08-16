import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const fmt  = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const fmtC = (n) => `₹${fmt(n)}`;

export default function Transactions() {
  const { user } = useAuth();
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(0);
  const limit = 20;

  const isAdmin = user?.role === 'admin';

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { limit, offset: page * limit };
    if (!isAdmin && user?.id) {
      params.user_id = user.id;
    }
    client.get('/transactions', { params })
      .then(r => { setData(r.data.transactions); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page, user, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search
    ? data.filter(t =>
        t.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.customer_name?.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Transactions' : 'My Orders'}</h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>{total} total records</p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative', width: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder={isAdmin ? "Search product or customer…" : "Search product…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          <motion.div
            className="card"
            style={{ padding: 0 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="table-wrapper" style={{ borderRadius: 20, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        No transactions found
                      </td>
                    </tr>
                  ) : filtered.map((t, i) => (
                    <motion.tr
                      key={t.transaction_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{t.transaction_id}</td>
                      <td style={{ fontWeight: 600, maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.product_name}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">{t.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {t.customer_name || 'Guest'}
                      </td>
                      <td style={{ fontWeight: 600 }}>×{t.quantity}</td>
                      <td>{fmtC(t.price)}</td>
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>
                        {fmtC(t.price * t.quantity)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(t.timestamp).toLocaleString('en-IN', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>
                ← Prev
              </button>
              <span style={{ padding: '7px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages - 1, p+1))} disabled={page >= totalPages - 1}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
