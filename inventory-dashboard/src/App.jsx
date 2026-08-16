import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Products     from './pages/Products';
import PricingEngine from './pages/PricingEngine';
import Analytics    from './pages/Analytics';
import Transactions from './pages/Transactions';

import CartIcon from './components/CartIcon';
import CartSidebar from './components/CartSidebar';
import { useAuth } from './context/AuthContext';

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      {user?.role === 'user' && (
        <>
          <CartIcon />
          <CartSidebar />
        </>
      )}
      <main style={{
        marginLeft: 'var(--sidebar-w)',
        flex: 1,
        padding: '36px 40px',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

function PageWrap({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><PageWrap><Dashboard /></PageWrap></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <AppLayout><PageWrap><Products /></PageWrap></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute role="admin">
            <AppLayout><PageWrap><PricingEngine /></PageWrap></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute role="admin">
            <AppLayout><PageWrap><Analytics /></PageWrap></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <AppLayout><PageWrap><Transactions /></PageWrap></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}
