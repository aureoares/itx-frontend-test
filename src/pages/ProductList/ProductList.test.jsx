import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductList from './ProductList';
import { productService } from '../../services/productService';

const mockCatalog = [
  {
    id: 'dev-1',
    brand: 'Acer',
    model: 'Iconia Talk S',
    price: '170',
    imgUrl: 'https://example.com/iconia.jpg',
  },
  {
    id: 'dev-2',
    brand: 'Apple',
    model: 'iPhone 13',
    price: '799',
    imgUrl: 'https://example.com/iphone.jpg',
  },
  {
    id: 'dev-3',
    brand: 'Alcatel',
    model: 'Flash Plus 2',
    price: '140',
    imgUrl: 'https://example.com/flash.jpg',
  },
];

describe('ProductList page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders skeleton cards while loading the catalog', async () => {
    let resolvePromise;
    vi.spyOn(productService, 'getProducts').mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { unmount } = render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    const skeletons = screen.getAllByTestId('product-skeleton');
    expect(skeletons.length).toBe(8);

    // Unmount before resolving to prevent un-acted state updates
    unmount();
    resolvePromise(mockCatalog);
  });

  it('renders complete catalog of products when request resolves', async () => {
    vi.spyOn(productService, 'getProducts').mockResolvedValue(mockCatalog);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('product-skeleton')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Iconia Talk S')).toBeInTheDocument();
    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    expect(screen.getByText('Flash Plus 2')).toBeInTheDocument();
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('filters catalog in real-time by brand and model (case-insensitive)', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProducts').mockResolvedValue(mockCatalog);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'apple');

    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    expect(screen.queryByText('Iconia Talk S')).not.toBeInTheDocument();
    expect(screen.queryByText('Flash Plus 2')).not.toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'talk s');

    expect(screen.getByText('Iconia Talk S')).toBeInTheDocument();
    expect(screen.queryByText('iPhone 13')).not.toBeInTheDocument();
  });

  it('handles search queries with leading/trailing whitespace properly', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProducts').mockResolvedValue(mockCatalog);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Iconia Talk S')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, '   Iconia   ');

    expect(screen.getByText('Iconia Talk S')).toBeInTheDocument();
    expect(screen.queryByText('iPhone 13')).not.toBeInTheDocument();
  });

  it('displays empty state feedback when query matches zero products and restores catalog on clear', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProducts').mockResolvedValue(mockCatalog);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'NonExistentModel999');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/No products match your search query/i)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);

    expect(screen.getByText('Iconia Talk S')).toBeInTheDocument();
    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    expect(screen.getByText('Flash Plus 2')).toBeInTheDocument();
  });

  it('displays error banner with retry button on network failure and recovers upon retry', async () => {
    const user = userEvent.setup();
    const getProductsSpy = vi.spyOn(productService, 'getProducts')
      .mockRejectedValueOnce(new Error('Network connection error'))
      .mockResolvedValueOnce(mockCatalog);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Network connection error')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    });

    expect(getProductsSpy).toHaveBeenCalledTimes(2);
    expect(getProductsSpy).toHaveBeenLastCalledWith({ forceRefresh: true });
  });

  it('navigates to product detail page when user clicks an item card', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProducts').mockResolvedValue(mockCatalog);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<div data-testid="pdp-view">Product Details Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    });

    const cardLink = screen.getByRole('link', { name: /iPhone 13/i });
    await user.click(cardLink);

    expect(screen.getByTestId('pdp-view')).toBeInTheDocument();
  });
});
