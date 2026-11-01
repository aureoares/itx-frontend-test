import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductActions from './ProductActions';
import { CartContext } from '../../../context/CartContext';

const mockProductMultiOptions = {
  id: 'dev-multi',
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

const mockProductSingleOption = {
  id: 'dev-single',
  options: {
    colors: [{ code: 1000, name: 'Black' }],
    storages: [{ code: 2000, name: '64 GB' }],
  },
};

function renderProductActions(product, customCartValue = {}) {
  const defaultCartValue = {
    cartCount: 0,
    setCartCount: vi.fn(),
    addToCart: vi.fn().mockResolvedValue({ totalCount: 1 }),
    isMutating: false,
    mutationError: null,
    ...customCartValue,
  };

  return {
    ...render(
      <CartContext.Provider value={defaultCartValue}>
        <ProductActions product={product} />
      </CartContext.Provider>
    ),
    cartValue: defaultCartValue,
  };
}

describe('ProductActions component', () => {
  it('pre-selects first available option by default when multiple options exist', () => {
    renderProductActions(mockProductMultiOptions);

    const blackColor = screen.getByRole('radio', { name: 'Black' });
    const whiteColor = screen.getByRole('radio', { name: 'White' });
    expect(blackColor).toHaveAttribute('aria-checked', 'true');
    expect(whiteColor).toHaveAttribute('aria-checked', 'false');

    const storage16 = screen.getByRole('radio', { name: '16 GB' });
    const storage32 = screen.getByRole('radio', { name: '32 GB' });
    expect(storage16).toHaveAttribute('aria-checked', 'true');
    expect(storage32).toHaveAttribute('aria-checked', 'false');
  });

  it('renders and pre-selects default options even if there is only 1 option available', () => {
    renderProductActions(mockProductSingleOption);

    const singleColor = screen.getByRole('radio', { name: 'Black' });
    const singleStorage = screen.getByRole('radio', { name: '64 GB' });

    expect(singleColor).toBeInTheDocument();
    expect(singleColor).toHaveAttribute('aria-checked', 'true');

    expect(singleStorage).toBeInTheDocument();
    expect(singleStorage).toHaveAttribute('aria-checked', 'true');
  });

  it('allows user to change active option selections', async () => {
    const user = userEvent.setup();
    renderProductActions(mockProductMultiOptions);

    const whiteColor = screen.getByRole('radio', { name: 'White' });
    await user.click(whiteColor);

    expect(whiteColor).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Black' })).toHaveAttribute('aria-checked', 'false');

    const storage32 = screen.getByRole('radio', { name: '32 GB' });
    await user.click(storage32);

    expect(storage32).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '16 GB' })).toHaveAttribute('aria-checked', 'false');
  });

  it('invokes addToCart with device id, selected colorCode, and storageCode', async () => {
    const user = userEvent.setup();
    const addToCartMock = vi.fn().mockResolvedValue({ totalCount: 1 });
    renderProductActions(mockProductMultiOptions, { addToCart: addToCartMock });

    // Select White (code 1001) and 32 GB (code 2001)
    await user.click(screen.getByRole('radio', { name: 'White' }));
    await user.click(screen.getByRole('radio', { name: '32 GB' }));

    const addButton = screen.getByRole('button', { name: 'Add to cart' });
    await user.click(addButton);

    expect(addToCartMock).toHaveBeenCalledWith({
      id: 'dev-multi',
      colorCode: 1001,
      storageCode: 2001,
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-success-banner')).toBeInTheDocument();
    });
  });

  it('disables add button and displays loading text while mutation is in-flight', () => {
    renderProductActions(mockProductMultiOptions, { isMutating: true });

    const addButton = screen.getByTestId('add-to-cart-button');
    expect(addButton).toBeDisabled();
    expect(addButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('displays error banner when cart mutation fails', async () => {
    const user = userEvent.setup();
    const addToCartMock = vi.fn().mockRejectedValue(new Error('Network connection error'));
    renderProductActions(mockProductMultiOptions, { addToCart: addToCartMock });

    const addButton = screen.getByRole('button', { name: 'Add to cart' });
    await user.click(addButton);

    await waitFor(() => {
      const errorBanner = screen.getByTestId('cart-error-banner');
      expect(errorBanner).toBeInTheDocument();
      expect(errorBanner).toHaveTextContent('Network connection error');
    });

    expect(addButton).not.toBeDisabled();
  });

  it('returns null when product is null or undefined', () => {
    const { container } = renderProductActions(null);
    expect(container).toBeEmptyDOMElement();
  });
});
