import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Zap, BarChart3,
  ArrowLeftRight, LogOut, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/products',     icon: Package,         label: 'Products'    },
  { to: '/pricing',      icon: Zap,             label: 'Pricing Engine', adminOnly: true },
  { to: '/analytics',    icon: BarChart3,        label: 'Analytics',  adminOnly: true },
  { to: '/transactions', icon: ArrowLeftRight,   label: 'Transactions' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 12px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 12px 20px' }}>
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '1.8rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}>
          <span style={{ color: '#FFFFFF' }}>link</span>
          <span style={{ color: 'var(--brand-green-light)' }}>it</span>
        </h1>
        <p style={{ fontSize: 11, color: '#64748B', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Pricing Intelligence
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#1E293B', margin: '0 4px 16px' }} />

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(({ to, icon: Icon, label }) => {
          const displayLabel = (to === '/transactions' && user?.role === 'user') ? 'My Orders' : label;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#FFFFFF' : '#94A3B8',
                background: isActive ? 'rgba(22,163,74,0.18)' : 'transparent',
                transition: 'all 0.15s',
                position: 'relative',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(22,163,74,0.18)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={18} style={{ flexShrink: 0, zIndex: 1, color: isActive ? 'var(--brand-green-light)' : 'inherit' }} />
                  <span style={{ zIndex: 1 }}>{displayLabel}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      right: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20,
                      background: 'var(--brand-green-light)',
                      borderRadius: '2px 0 0 2px',
                    }} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User block */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid #1E293B',
        marginTop: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'rgba(22,163,74,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--brand-green-light)',
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </p>
            <p style={{ fontSize: 11, color: '#64748B', margin: 0, textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-sm"
          style={{ width: '100%', background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', justifyContent: 'center' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
