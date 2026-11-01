/**
 * Formats a raw price value into a localized currency string with Euro symbol.
 * If price is null, undefined, or empty string, returns 'N/A'.
 *
 * @param {string | number | null | undefined} price
 * @returns {string} Formatted price (e.g. '170 €' or 'N/A')
 */
export function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return 'N/A';
  }
  return `${price} €`;
}
