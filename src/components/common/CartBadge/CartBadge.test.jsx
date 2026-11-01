import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartProvider } from '../../../context/CartContext';
import CartBadge from './CartBadge';

describe('CartBadge component', () => {
  it('displays "0" and accessible empty label when cart has 0 items', () => {
    render(
      <CartProvider initialCount={0}>
        <CartBadge />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('0');
    expect(
      screen.getByLabelText('Shopping cart is empty, 0 items')
    ).toBeInTheDocument();
  });

  it('displays count and plural label when cart has multiple items', () => {
    render(
      <CartProvider initialCount={4}>
        <CartBadge />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('4');
    expect(
      screen.getByLabelText('Shopping cart: 4 items')
    ).toBeInTheDocument();
  });

  it('displays count and singular label when cart has 1 item', () => {
    render(
      <CartProvider initialCount={1}>
        <CartBadge />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('1');
    expect(
      screen.getByLabelText('Shopping cart: 1 item')
    ).toBeInTheDocument();
  });
});
