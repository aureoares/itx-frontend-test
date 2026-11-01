import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound component', () => {
  it('renders 404 heading and return home link', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
    const returnLink = screen.getByRole('link', { name: 'Return to Product List' });
    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/');
  });
});
