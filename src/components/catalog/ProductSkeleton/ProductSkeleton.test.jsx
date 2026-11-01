import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductSkeleton from './ProductSkeleton';

describe('ProductSkeleton component', () => {
  it('renders skeleton card placeholder with accessible aria-hidden attribute', () => {
    render(<ProductSkeleton />);

    const skeleton = screen.getByTestId('product-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });
});
