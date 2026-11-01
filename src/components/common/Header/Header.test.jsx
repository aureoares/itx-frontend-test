import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../../context/CartContext';
import Header from './Header';

describe('Header component', () => {
  it('renders logo link pointing to home, breadcrumbs, and cart badge', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CartProvider initialCount={2}>
          <Header />
        </CartProvider>
      </MemoryRouter>
    );

    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();

    const logoLink = screen.getByRole('link', { name: 'Mobile Device Store Home' });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
    expect(screen.getByText('DeviceStore')).toBeInTheDocument();

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('2');
  });
});
