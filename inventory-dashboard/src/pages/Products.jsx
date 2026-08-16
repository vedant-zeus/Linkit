import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, CheckCircle } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(n);

const CATEGORY_COLORS = {
  'Electronics':    '#3B82F6',
  'Footwear':       '#8B5CF6',
  'Clothing':       '#F59E0B',
  'Home & Kitchen': '#EF4444',
  'Sports':         '#16A34A',
};

export default function Products() {
  const { user } = useAuth();
  const { addToCart, cart } = useCart();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [loading,    setLoading]    = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search)   params.search   = search;
    client.get('/products', { params })
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    client.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const isAdmin = user?.role === 'admin';

  const stockStatus = (stock, reorder) => {
    if (stock === 0)       return { label: 'Out of Stock', cls: 'badge-red'   };
    if (!isAdmin)          return { label: 'In Stock',     cls: 'badge-green' };
    
    if (stock <= reorder)  return { label: 'Low',      cls: 'badge-amber' };
    if (stock <= reorder * 2) return { label: 'Normal', cls: 'badge-blue' };
    return                        { label: 'In Stock', cls: 'badge-green' };
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Products Admin' : 'Shop Products'}</h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>{products.length} items available</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flex: '1 1 300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <select
          className="input"
          style={{ width: 'auto', minWidth: 160 }}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {products.map((p, i) => {
            const status = stockStatus(p.stock, p.reorder_point);
            const catColor = CATEGORY_COLORS[p.category] || '#64748B';
            const compAvg = p.competitor_avg ? +p.competitor_avg : null;
            const vsComp = compAvg ? (((p.current_price - compAvg) / compAvg) * 100).toFixed(1) : null;
            
            // Check if product views are recorded when user clicks or views them
            const handleRecordView = () => {
              if (!isAdmin) {
                client.post(`/products/${p.product_id}/view`, { user_id: user?.id });
              }
            };

            const inCart = cart.find(item => item.product_id === p.product_id);

            return (
              <motion.div
                key={p.product_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}
                onClick={handleRecordView}
                className="card"
                style={{ cursor: 'default', transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 280 }}
              >
                <div>
                  {/* Category chip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                      color: catColor,
                      background: `${catColor}18`,
                      padding: '3px 10px', borderRadius: 99,
                    }}>
                      {p.category}
                    </span>
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                  </div>

                  {/* Name */}
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    {p.name}
                  </h3>
                </div>

                <div>
                  {/* Price block */}
                  <div style={{
                    background: 'var(--bg-base)',
                    borderRadius: 12, padding: '12px 14px',
                    marginBottom: 14,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                          {isAdmin ? 'Current Price' : 'Price'}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Poppins', sans-serif" }}>
                          ₹{fmt(p.current_price)}
                        </div>
                      </div>
                      {isAdmin && vsComp !== null && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>vs market</div>
                          <div style={{
                            fontSize: 13, fontWeight: 700,
                            color: +vsComp <= 0 ? '#16A34A' : '#EF4444',
                          }}>
                            {+vsComp > 0 ? '+' : ''}{vsComp}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action or stats footer */}
                  {isAdmin ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Stock',   value: p.stock },
                        { label: '7d Sales', value: p.sales_7d || 0 },
                        { label: 'Views',   value: p.views || 0 },
                      ].map(stat => (
                        <div key={stat.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(stat.value)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => p.stock > 0 && addToCart(p)}
                      className={`btn ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                      disabled={p.stock === 0}
                    >
                      {inCart ? (
                        <>
                          <CheckCircle size={15} /> Added ({inCart.quantity})
                        </>
                      ) : p.stock === 0 ? (
                        'Sold Out'
                      ) : (
                        <>
                          <ShoppingCart size={15} /> Add to Cart
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
