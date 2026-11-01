import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetailsSkeleton from './ProductDetailsSkeleton';

describe('ProductDetailsSkeleton component', () => {
  it('renders placeholder container with accessible aria-hidden attribute and test id', () => {
    render(<ProductDetailsSkeleton />);

    const skeleton = screen.getByTestId('product-details-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });
});
