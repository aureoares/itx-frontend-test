import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CART_STORAGE_KEY = 'itx_cart_count';

export const CartContext = createContext(null);

export function CartProvider({ children, initialCount }) {
  const [cartCount, setCartCountState] = useState(() => {
    if (typeof initialCount === 'number') {
      return initialCount;
    }
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }
    } catch {
      // Storage unavailable or disabled
    }
    return 0;
  });

  const setCartCount = useCallback((newCount) => {
    const validCount = Math.max(0, parseInt(newCount, 10) || 0);
    setCartCountState(validCount);
    try {
      localStorage.setItem(CART_STORAGE_KEY, validCount.toString());
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const addToCart = useCallback((amount = 1) => {
    setCartCountState((prev) => {
      const updated = prev + Math.max(0, parseInt(amount, 10) || 1);
      try {
        localStorage.setItem(CART_STORAGE_KEY, updated.toString());
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === CART_STORAGE_KEY && event.newValue !== null) {
        const parsed = parseInt(event.newValue, 10);
        if (!Number.isNaN(parsed)) {
          setCartCountState(parsed);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
