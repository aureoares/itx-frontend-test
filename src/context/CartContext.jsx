import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';

const CART_STORAGE_KEY = 'itx_cart_count';

export const CartContext = createContext(null);

export function CartProvider({ children, initialCount }) {
  const [cartCount, setCartCountState] = useState(() => {
    if (typeof initialCount === 'number') {
      return initialCount;
    }
    return cartService.getStoredCartCount();
  });

  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  const setCartCount = useCallback((newCount) => {
    const validCount = cartService.setStoredCartCount(newCount);
    setCartCountState(validCount);
  }, []);

  const addToCart = useCallback(async (amountOrPayload = 1) => {
    // If payload object is passed ({ id, colorCode, storageCode })
    if (typeof amountOrPayload === 'object' && amountOrPayload !== null && amountOrPayload.id) {
      setIsMutating(true);
      setMutationError(null);
      try {
        const { totalCount } = await cartService.addDeviceToCart(amountOrPayload);
        setCartCountState(totalCount);
        return totalCount;
      } catch (err) {
        setMutationError(err);
        throw err;
      } finally {
        setIsMutating(false);
      }
    }

    // Direct numeric increment fallback
    const increment = typeof amountOrPayload === 'number' ? Math.max(0, amountOrPayload) : 1;
    setCartCountState((prev) => {
      const updated = prev + increment;
      cartService.setStoredCartCount(updated);
      return updated;
    });
    return cartCount + increment;
  }, [cartCount]);

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
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        addToCart,
        isMutating,
        mutationError,
      }}
    >
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
