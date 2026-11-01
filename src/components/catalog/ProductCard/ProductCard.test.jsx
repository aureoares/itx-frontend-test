import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { formatPrice } from '../../../utils/formatters';

const mockProduct = {
  id: 'test-device-101',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  imgUrl: 'https://itx-frontend-test.onrender.com/images/test-device-101.jpg',
};

describe('ProductCard component', () => {
  it('renders device brand, model, image, and formatted price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Acer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByText('170 €')).toBeInTheDocument();

    const image = screen.getByRole('img', { name: 'Acer Iconia Talk S' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.imgUrl);
  });

  it('renders link pointing to /product/:id with descriptive accessible aria-label', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Acer Iconia Talk S, 170 €' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/product/test-device-101');
  });

  it('handles missing price gracefully with N/A display', () => {
    const productWithoutPrice = {
      ...mockProduct,
      price: '',
    };

    render(
      <MemoryRouter>
        <ProductCard product={productWithoutPrice} />
      </MemoryRouter>
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays visual SVG placeholder when product image fails to load via onError', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-image-fallback')).toBeInTheDocument();
  });

  it('displays placeholder directly when imgUrl is empty or missing', () => {
    const productWithoutImage = {
      ...mockProduct,
      imgUrl: null,
    };

    render(
      <MemoryRouter>
        <ProductCard product={productWithoutImage} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-image-fallback')).toBeInTheDocument();
  });

  it('returns null when product prop is null or undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={null} />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('formatPrice helper', () => {
  it('formats numeric and string prices with Euro symbol', () => {
    expect(formatPrice(170)).toBe('170 €');
    expect(formatPrice('250')).toBe('250 €');
  });

  it('returns N/A for null, undefined, or empty string', () => {
    expect(formatPrice(null)).toBe('N/A');
    expect(formatPrice(undefined)).toBe('N/A');
    expect(formatPrice('')).toBe('N/A');
  });
});
