import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductGrid from './ProductGrid';

describe('ProductGrid component', () => {
  it('renders section element with accessible label and test id', () => {
    render(
      <ProductGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </ProductGrid>
    );

    const grid = screen.getByTestId('product-grid');
    expect(grid).toBeInTheDocument();
    expect(grid.tagName).toBe('SECTION');
    expect(grid).toHaveAttribute('aria-label', 'Product catalog grid');
  });

  it('renders all passed children elements correctly', () => {
    render(
      <ProductGrid>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ProductGrid>
    );

    expect(screen.getByTestId('child-1')).toHaveTextContent('Child 1');
    expect(screen.getByTestId('child-2')).toHaveTextContent('Child 2');
    expect(screen.getByTestId('child-3')).toHaveTextContent('Child 3');
  });

  it('appends custom className when provided', () => {
    render(
      <ProductGrid className="custom-test-class">
        <div>Child</div>
      </ProductGrid>
    );

    const grid = screen.getByTestId('product-grid');
    expect(grid.className).toContain('custom-test-class');
  });
});
