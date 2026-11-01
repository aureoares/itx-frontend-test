import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs component', () => {
  it('renders "Home" as current page when at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Breadcrumbs />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
    const currentCrumb = screen.getByText('Home');
    expect(currentCrumb).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders "Home" link and fallback "Product Details" on product detail path', () => {
    render(
      <MemoryRouter initialEntries={['/product/ZmGrkLRPXOTpxsU4jjAcv']}>
        <Breadcrumbs />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    const detailCrumb = screen.getByText('Product Details');
    expect(detailCrumb).toHaveAttribute('aria-current', 'page');
  });

  it('renders custom currentTitle when provided for detail view', () => {
    render(
      <MemoryRouter initialEntries={['/product/ZmGrkLRPXOTpxsU4jjAcv']}>
        <Breadcrumbs currentTitle="Acer Iconia Talk S" />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    const titleCrumb = screen.getByText('Acer Iconia Talk S');
    expect(titleCrumb).toHaveAttribute('aria-current', 'page');
  });
});
