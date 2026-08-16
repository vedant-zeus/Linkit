import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      background: 'radial-gradient(ellipse 120% 80% at 10% 10%, #F0FDF4 0%, transparent 50%), radial-gradient(ellipse 100% 60% at 90% 90%, #ECFDF5 0%, transparent 50%), #F8FAFC',
    }}>
      {/* Left brand panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
      }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '4rem',
            fontWeight: 800,
            letterSpacing: '-0.06em',
            lineHeight: 0.95,
            marginBottom: 20,
          }}>
            <span style={{ color: '#0F172A' }}>link</span>
            <span style={{ color: '#16A34A' }}>it</span>
          </h1>
          <p style={{ fontSize: 18, color: '#475569', maxWidth: 360, lineHeight: 1.65 }}>
            Intelligent dynamic pricing — powered by demand signals, inventory depth, and market data.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['📊', 'Real-time pricing recommendations'],
              ['🧠', 'Demand & elasticity analysis'],
              ['💹', 'Profit-optimized price engine'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right login card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            padding: '44px 40px',
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 32px 64px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ color: '#64748B', fontSize: 14 }}>Sign in to your Linkit workspace</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Username
              </label>
              <input
                id="login-username"
                className="input"
                placeholder="admin or user"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#DC2626',
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 4, justifyContent: 'center' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            padding: '16px',
            background: '#F8FAFC',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Demo Credentials
            </p>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, margin: 0 }}>
              Admin → <code style={{ background: '#E2E8F0', padding: '1px 6px', borderRadius: 4 }}>admin</code> / <code style={{ background: '#E2E8F0', padding: '1px 6px', borderRadius: 4 }}>admin123</code><br />
              User → <code style={{ background: '#E2E8F0', padding: '1px 6px', borderRadius: 4 }}>user</code> / <code style={{ background: '#E2E8F0', padding: '1px 6px', borderRadius: 4 }}>user123</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
