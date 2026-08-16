import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus, CheckCircle } from 'lucide-react';

const fmtC = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;

export default function CartSidebar() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    checkout,
    checkingOut,
    checkoutError,
    checkoutSuccess,
  } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.current_price || item.price) * item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => !checkingOut && setIsCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000000',
              zIndex: 140,
            }}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 400,
              background: '#FFFFFF',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              zIndex: 150,
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag style={{ color: 'var(--brand-green)' }} size={22} />
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Your Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 4,
                  borderRadius: '50%',
                }}
                disabled={checkingOut}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', marginRight: -8, paddingRight: 8 }}>
              {checkoutSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 16 }}>
                  <CheckCircle size={56} style={{ color: 'var(--brand-green)' }} />
                  <div>
                    <h3 style={{ marginBottom: 6 }}>Purchase Successful!</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Thank you for your order. The price engine has registered your purchase signals!
                    </p>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 12 }}>
                  <ShoppingBag size={48} strokeWidth={1.5} />
                  <p style={{ fontSize: 14 }}>Your cart is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        paddingBottom: 16,
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--brand-green)', fontWeight: 700, marginBottom: 8 }}>
                          {fmtC(item.current_price || item.price)}
                        </p>
                        
                        {/* Qty controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            overflow: 'hidden',
                          }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              style={{ border: 'none', background: '#F8FAFC', padding: '4px 8px', cursor: 'pointer' }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              style={{ border: 'none', background: '#F8FAFC', padding: '4px 8px', cursor: 'pointer' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: 4,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!checkoutSuccess && cart.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Total:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {fmtC(total)}
                  </span>
                </div>

                {checkoutError && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 10,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#DC2626',
                    marginBottom: 12,
                  }}>
                    ⚠️ {checkoutError}
                  </div>
                )}

                <button
                  onClick={checkout}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Processing Checkout…' : 'Place Order'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
