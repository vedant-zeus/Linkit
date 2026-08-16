import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(`linkit_cart_${user?.id || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem(`linkit_cart_${user?.id || 'guest'}`, JSON.stringify(cart));
  }, [cart, user]);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setCheckoutSuccess(false);
    setCheckoutError('');
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product_id === productId ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const checkout = useCallback(async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setCheckoutError('');
    setCheckoutSuccess(false);

    try {
      // Loop through all items and record transaction
      for (const item of cart) {
        await client.post('/transactions', {
          user_id: user?.id || null,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.current_price || item.price,
        });
      }
      clearCart();
      setCheckoutSuccess(true);
      setTimeout(() => setIsCartOpen(false), 2000);
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Checkout failed. Please check stock level.');
    } finally {
      setCheckingOut(false);
    }
  }, [cart, user, clearCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        isCartOpen,
        setIsCartOpen,
        checkingOut,
        checkoutError,
        checkoutSuccess,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
