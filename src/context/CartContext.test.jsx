import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';

function TestConsumer() {
  const { cartCount, addToCart, setCartCount } = useCart();
  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <button onClick={() => addToCart(1)}>Add One</button>
      <button onClick={() => setCartCount(5)}>Set Five</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes with 0 when no stored count exists', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('restores count from localStorage', () => {
    localStorage.setItem('itx_cart_count', '3');
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('increments count and updates localStorage on addToCart', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add One' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(localStorage.getItem('itx_cart_count')).toBe('1');
  });

  it('updates count and localStorage on setCartCount', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Set Five' }));
    expect(screen.getByTestId('count')).toHaveTextContent('5');
    expect(localStorage.getItem('itx_cart_count')).toBe('5');
  });

  it('throws an error if useCart is consumed outside CartProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useCart must be used within a CartProvider');
    consoleError.mockRestore();
  });
});
