import styles from './SearchBar.module.css';

/**
 * SearchBar component provides accessible text input for real-time catalog filtering.
 *
 * @param {object} props
 * @param {string} props.value - Active search query text
 * @param {(query: string) => void} props.onChange - Change handler invoked with new search string
 * @param {string} [props.placeholder='Search devices...'] - Input placeholder text
 * @param {number} [props.resultCount] - Optional count of matched results
 */
export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search devices...',
  resultCount,
}) {
  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={styles.searchContainer} role="search">
      <label htmlFor="catalog-search" className={styles.srOnly}>
        Search devices by brand or model
      </label>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          id="catalog-search"
          type="search"
          className={styles.input}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="Search devices by brand or model"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search query"
          >
            ×
          </button>
        ) : null}
      </div>
      {typeof resultCount === 'number' && (
        <span className={styles.resultCount} aria-live="polite">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </span>
      )}
    </div>
  );
}
