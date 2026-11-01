import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductImage from './ProductImage';

describe('ProductImage component', () => {
  const sampleUrl = 'https://itx-frontend-test.onrender.com/images/sample.jpg';

  it('renders image element with provided URL and accessible alt text', () => {
    render(<ProductImage imgUrl={sampleUrl} alt="Sample Device" />);

    const image = screen.getByRole('img', { name: 'Sample Device' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', sampleUrl);
    expect(screen.queryByTestId('product-image-fallback')).not.toBeInTheDocument();
  });

  it('renders SVG placeholder when imgUrl is null or empty', () => {
    render(<ProductImage imgUrl={null} alt="Empty Device" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-image-fallback')).toBeInTheDocument();
  });

  it('switches to fallback placeholder when image triggers load error', () => {
    render(<ProductImage imgUrl={sampleUrl} alt="Broken Device" />);

    const image = screen.getByRole('img', { name: 'Broken Device' });
    fireEvent.error(image);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-image-fallback')).toBeInTheDocument();
  });

  it('re-renders image and clears fallback when imgUrl prop updates', () => {
    const { rerender } = render(<ProductImage imgUrl={sampleUrl} alt="Device" />);

    const image = screen.getByRole('img');
    fireEvent.error(image);
    expect(screen.getByTestId('product-image-fallback')).toBeInTheDocument();

    const newUrl = 'https://itx-frontend-test.onrender.com/images/new-sample.jpg';
    rerender(<ProductImage imgUrl={newUrl} alt="Device" />);

    const newImage = screen.getByRole('img', { name: 'Device' });
    expect(newImage).toBeInTheDocument();
    expect(newImage).toHaveAttribute('src', newUrl);
  });
});
