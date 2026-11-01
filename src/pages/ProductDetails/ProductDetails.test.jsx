import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetails from './ProductDetails';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { CartProvider } from '../../context/CartContext';
import { ApiError } from '../../services/apiClient';

const mockDetailData = {
  id: 'dev-101',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  imgUrl: 'https://example.com/iconia.jpg',
  cpu: 'Quad-core 1.3 GHz',
  ram: '2 GB',
  os: 'Android 6.0',
  displayResolution: '720 x 1280 pixels',
  battery: '3780 mAh',
  primaryCamera: ['13 MP'],
  secondaryCmera: '2 MP',
  dimentions: '191.7 x 101 x 9.3 mm',
  weight: '260',
  options: {
    colors: [
      { code: 1000, name: 'Black' },
      { code: 1001, name: 'White' },
    ],
    storages: [
      { code: 2000, name: '16 GB' },
      { code: 2001, name: '32 GB' },
    ],
  },
};

function renderProductDetails(route = '/product/dev-101') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CartProvider initialCount={0}>
        <Routes>
          <Route path="/" element={<div data-testid="catalog-home">Catalog Home</div>} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
}

describe('ProductDetails page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders skeleton placeholders while device specifications are loading', async () => {
    let resolvePromise;
    vi.spyOn(productService, 'getProductById').mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { unmount } = renderProductDetails();

    expect(screen.getByTestId('product-details-skeleton')).toBeInTheDocument();

    unmount();
    resolvePromise(mockDetailData);
  });

  it('renders complete two-column specifications, image, and pre-selected selectors', async () => {
    vi.spyOn(productService, 'getProductById').mockResolvedValue(mockDetailData);

    renderProductDetails();

    await waitFor(() => {
      expect(screen.queryByTestId('product-details-skeleton')).not.toBeInTheDocument();
    });

    // Image column
    const image = screen.getByRole('img', { name: 'Acer Iconia Talk S' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockDetailData.imgUrl);

    // Specs column
    expect(screen.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByText('170 €')).toBeInTheDocument();
    expect(screen.getByText('Quad-core 1.3 GHz')).toBeInTheDocument();
    expect(screen.getByText('191.7 x 101 x 9.3 mm')).toBeInTheDocument();

    // Selectors pre-selected by default
    const blackRadio = screen.getByRole('radio', { name: 'Black' });
    const storage16Radio = screen.getByRole('radio', { name: '16 GB' });
    expect(blackRadio).toHaveAttribute('aria-checked', 'true');
    expect(storage16Radio).toHaveAttribute('aria-checked', 'true');
  });

  it('allows user to change variants and submits configured device to the cart', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProductById').mockResolvedValue(mockDetailData);
    const addDeviceSpy = vi.spyOn(cartService, 'addDeviceToCart').mockResolvedValue({
      totalCount: 1,
      apiResponse: { count: 1 },
    });

    renderProductDetails();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument();
    });

    // Switch color to White (code 1001) and storage to 32 GB (code 2001)
    await user.click(screen.getByRole('radio', { name: 'White' }));
    await user.click(screen.getByRole('radio', { name: '32 GB' }));

    const addButton = screen.getByRole('button', { name: 'Add to cart' });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('cart-success-banner')).toBeInTheDocument();
    });

    expect(addDeviceSpy).toHaveBeenCalledWith({
      id: 'dev-101',
      colorCode: 1001,
      storageCode: 2001,
    });
  });

  it('renders 404 not-found view when device identifier does not exist', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProductById').mockRejectedValue(
      new ApiError('Product not found', 404)
    );

    renderProductDetails('/product/invalid-id-999');

    await waitFor(() => {
      expect(screen.getByTestId('pdp-not-found')).toBeInTheDocument();
    });

    expect(screen.getByText('Device Not Found')).toBeInTheDocument();

    const returnLink = screen.getByRole('link', { name: 'Return to Catalog' });
    expect(returnLink).toBeInTheDocument();

    await user.click(returnLink);
    expect(screen.getByTestId('catalog-home')).toBeInTheDocument();
  });

  it('renders error state on network failure and allows retrying fetch', async () => {
    const user = userEvent.setup();
    const getProductSpy = vi.spyOn(productService, 'getProductById')
      .mockRejectedValueOnce(new Error('Network error loading details'))
      .mockResolvedValueOnce(mockDetailData);

    renderProductDetails();

    await waitFor(() => {
      expect(screen.getByTestId('pdp-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error loading details')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument();
    });

    expect(getProductSpy).toHaveBeenCalledTimes(2);
    expect(getProductSpy).toHaveBeenLastCalledWith('dev-101', { forceRefresh: true });
  });

  it('navigates back to catalog when user clicks back navigation link', async () => {
    const user = userEvent.setup();
    vi.spyOn(productService, 'getProductById').mockResolvedValue(mockDetailData);

    renderProductDetails();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument();
    });

    const backLink = screen.getByRole('link', { name: 'Return to device catalog' });
    await user.click(backLink);

    expect(screen.getByTestId('catalog-home')).toBeInTheDocument();
  });
});
