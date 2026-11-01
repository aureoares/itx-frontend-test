import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../router';
import { CartProvider } from '../context/CartContext';

function renderAppWithRoute(initialEntries = ['/'], initialCount = 0) {
  const testRouter = createMemoryRouter(routes, {
    initialEntries,
  });

  return render(
    <CartProvider initialCount={initialCount}>
      <RouterProvider router={testRouter} />
    </CartProvider>
  );
}

describe('AppShell Integration Tests', () => {
  it('renders application shell with header, main content, and "0" cart count at root', () => {
    renderAppWithRoute(['/'], 0);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('product-list-page')).toBeInTheDocument();
    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('0');
  });

  it('renders breadcrumbs on detail page and allows navigating back to home via logo and breadcrumbs', async () => {
    const user = userEvent.setup();
    renderAppWithRoute(['/product/sample-device-123'], 2);

    expect(screen.getByTestId('product-details-page')).toBeInTheDocument();
    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('2');

    // Breadcrumbs should have Home link and fallback Product Details
    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const homeBreadcrumb = within(breadcrumbNav).getByRole('link', { name: 'Home' });
    expect(homeBreadcrumb).toBeInTheDocument();
    expect(within(breadcrumbNav).getByText('Product Details')).toHaveAttribute('aria-current', 'page');

    // Click Home breadcrumb to navigate back to list
    await user.click(homeBreadcrumb);
    expect(screen.getByTestId('product-list-page')).toBeInTheDocument();

    // Re-verify logo also works for navigation
    const logoLink = screen.getByRole('link', { name: 'Mobile Device Store Home' });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders 404 Not Found view when navigating to an unrecognized route', async () => {
    const user = userEvent.setup();
    renderAppWithRoute(['/unknown-route-path'], 0);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();

    const returnLink = screen.getByRole('link', { name: 'Return to Product List' });
    expect(returnLink).toBeInTheDocument();

    await user.click(returnLink);
    expect(screen.getByTestId('product-list-page')).toBeInTheDocument();
  });
});
