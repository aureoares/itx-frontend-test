import { apiClient } from './apiClient';
import { storageService } from './storageService';

export const CART_STORAGE_KEY = 'cart_count';

/**
 * Retrieves the currently persisted accumulated cart count.
 * @returns {number}
 */
export function getStoredCartCount() {
  const stored = storageService.getItem(CART_STORAGE_KEY);
  if (stored === null || stored === undefined) {
    return 0;
  }
  const parsed = parseInt(stored, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

/**
 * Persists an accumulated cart count.
 * @param {number} count
 * @returns {number} The persisted count
 */
export function setStoredCartCount(count) {
  const validCount = Math.max(0, parseInt(count, 10) || 0);
  storageService.setItem(CART_STORAGE_KEY, validCount);
  return validCount;
}

/**
 * Dispatches a cart addition mutation to the remote API and increments the accumulated cart count.
 *
 * @param {{ id: string, colorCode: number, storageCode: number }} payload
 * @param {object} [options]
 * @returns {Promise<{ totalCount: number, apiResponse: { count: number } }>}
 */
export async function addDeviceToCart(payload, options = {}) {
  const apiResponse = await apiClient.postAddToCart(payload, options);

  // Accumulate count locally since the mock API statelessly returns { count: 1 }
  const currentCount = getStoredCartCount();
  const increment = typeof apiResponse?.count === 'number' && apiResponse.count > 0 ? apiResponse.count : 1;
  const newCount = currentCount + increment;

  setStoredCartCount(newCount);

  return {
    totalCount: newCount,
    apiResponse,
  };
}

/**
 * Resets the accumulated cart count to 0.
 */
export function resetCart() {
  return setStoredCartCount(0);
}

export const cartService = {
  CART_STORAGE_KEY,
  getStoredCartCount,
  setStoredCartCount,
  addDeviceToCart,
  resetCart,
};
