import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar component', () => {
  it('renders search input with accessible label and default placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const searchInput = screen.getByRole('searchbox', { name: 'Search devices by brand or model' });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search devices...');
    expect(searchInput).toHaveValue('');
  });

  it('renders custom placeholder when provided', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Find a phone..." />);

    const searchInput = screen.getByPlaceholderText('Find a phone...');
    expect(searchInput).toBeInTheDocument();
  });

  it('invokes onChange callback when user types in the input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'Apple');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays clear button when value is non-empty and resets input upon click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="Iconia" onChange={handleChange} />);

    const clearButton = screen.getByRole('button', { name: 'Clear search query' });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('does not display clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const clearButton = screen.queryByRole('button', { name: 'Clear search query' });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('renders result count with correct singular/plural grammar', () => {
    const { rerender } = render(<SearchBar value="Test" onChange={() => {}} resultCount={1} />);
    expect(screen.getByText('1 item')).toBeInTheDocument();

    rerender(<SearchBar value="Test" onChange={() => {}} resultCount={42} />);
    expect(screen.getByText('42 items')).toBeInTheDocument();
  });
});
