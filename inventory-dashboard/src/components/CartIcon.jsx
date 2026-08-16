import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartIcon() {
  const { cart, setIsCartOpen } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 40,
        zIndex: 90,
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        style={{
          background: 'var(--brand-green)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
          position: 'relative',
        }}
      >
        <ShoppingCart size={20} />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                border: '2px solid #FFFFFF',
              }}
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
