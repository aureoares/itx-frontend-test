import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';
import { cartService } from '../services/cartService';
import { _resetStorageState } from '../services/storageService';

function TestConsumer() {
  const { cartCount, addToCart, setCartCount, isMutating, mutationError } = useCart();
  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <span data-testid="mutating">{isMutating ? 'loading' : 'idle'}</span>
      {mutationError && <span data-testid="error">{mutationError.message}</span>}
      <button onClick={() => addToCart(1)}>Add One</button>
      <button onClick={() => setCartCount(5)}>Set Five</button>
      <button
        onClick={() =>
          addToCart({ id: 'test-device', colorCode: 1, storageCode: 2 }).catch(() => {})
        }
      >
        Add Device Payload
      </button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetStorageState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    _resetStorageState();
  });

  it('initializes with 0 when no stored count exists', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('mutating')).toHaveTextContent('idle');
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

  it('increments count and updates localStorage on numeric addToCart', async () => {
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

  it('executes cart mutation and updates count when device payload is passed', async () => {
    const user = userEvent.setup();
    const serviceSpy = vi.spyOn(cartService, 'addDeviceToCart').mockResolvedValue({
      totalCount: 4,
      apiResponse: { count: 1 },
    });

    render(
      <CartProvider initialCount={3}>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add Device Payload' }));

    expect(serviceSpy).toHaveBeenCalledWith({
      id: 'test-device',
      colorCode: 1,
      storageCode: 2,
    });
    expect(screen.getByTestId('count')).toHaveTextContent('4');
  });

  it('handles mutation rejection and captures mutationError', async () => {
    const user = userEvent.setup();
    vi.spyOn(cartService, 'addDeviceToCart').mockRejectedValue(new Error('Network Failure'));

    render(
      <CartProvider initialCount={2}>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add Device Payload' }));

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('error')).toHaveTextContent('Network Failure');
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
