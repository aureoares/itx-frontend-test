import { apiClient } from './apiClient';
import { storageService } from './storageService';

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour = 3,600,000 milliseconds
export const CACHE_KEY_PRODUCTS = 'cache_products';

/**
 * Builds the cache key for a specific device identifier.
 * @param {string} id
 * @returns {string}
 */
export function getProductCacheKey(id) {
  return `cache_product_${id}`;
}

/**
 * Validates whether an envelope's timestamp is within the 1-hour TTL window.
 * @param {{ timestamp?: number } | null} envelope
 * @param {number} [now]
 * @returns {boolean}
 */
export function isCacheValid(envelope, now = Date.now()) {
  if (!envelope || typeof envelope.timestamp !== 'number' || Number.isNaN(envelope.timestamp)) {
    return false;
  }
  const age = now - envelope.timestamp;
  return age >= 0 && age < CACHE_TTL_MS;
}

/**
 * Retrieves the device catalog with 1-hour client-side caching.
 *
 * If a valid cache envelope exists, returns cached data immediately with zero network requests.
 * If missing or expired (>= 1 hour), fetches fresh catalog data from the remote API and updates the cache.
 *
 * @param {{ forceRefresh?: boolean, signal?: AbortSignal }} [options]
 * @returns {Promise<Array<object>>}
 */
export async function getProducts(options = {}) {
  const { forceRefresh = false, signal } = options;

  if (!forceRefresh) {
    const cachedEnvelope = storageService.getEnvelope(CACHE_KEY_PRODUCTS);
    if (isCacheValid(cachedEnvelope)) {
      return cachedEnvelope.data;
    }
  }

  const freshProducts = await apiClient.getProducts({ signal });
  storageService.setEnvelope(CACHE_KEY_PRODUCTS, freshProducts);
  return freshProducts;
}

/**
 * Retrieves specifications for a single device with 1-hour client-side caching.
 *
 * @param {string} id - Product ID
 * @param {{ forceRefresh?: boolean, signal?: AbortSignal }} [options]
 * @returns {Promise<object>}
 */
export async function getProductById(id, options = {}) {
  if (!id) {
    throw new Error('Product ID is required');
  }

  const { forceRefresh = false, signal } = options;
  const cacheKey = getProductCacheKey(id);

  if (!forceRefresh) {
    const cachedEnvelope = storageService.getEnvelope(cacheKey);
    if (isCacheValid(cachedEnvelope)) {
      return cachedEnvelope.data;
    }
  }

  const freshDetail = await apiClient.getProductById(id, { signal });
  storageService.setEnvelope(cacheKey, freshDetail);
  return freshDetail;
}

/**
 * Purges cached catalog and/or specific device detail entries.
 * @param {string} [id] If omitted, removes catalog cache; if provided, removes specific device cache.
 */
export function clearProductCache(id) {
  if (id) {
    storageService.removeItem(getProductCacheKey(id));
  } else {
    storageService.removeItem(CACHE_KEY_PRODUCTS);
  }
}

export const productService = {
  getProducts,
  getProductById,
  clearProductCache,
  isCacheValid,
  CACHE_TTL_MS,
  CACHE_KEY_PRODUCTS,
  getProductCacheKey,
};
