const BASE_URL = 'https://itx-frontend-test.onrender.com';
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Normalized application error for remote HTTP operations.
 */
export class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Low-level HTTP transport wrapper with timeout and error diagnostics.
 *
 * @param {string} endpoint - Path relative to base URL (e.g. '/api/product')
 * @param {RequestInit & { timeoutMs?: number }} options - Fetch options with optional timeout
 * @returns {Promise<any>} Parsed JSON response body
 */
export async function request(endpoint, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {}, ...restOptions } = options;
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  // Link caller signal if passed
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(options.signal.reason), { once: true });
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorData = null;
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        errorData = await response.json();
        if (errorData && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      } catch {
        // Response body was not JSON
      }
      throw new ApiError(errorMessage, response.status, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError' || controller.signal.aborted) {
      throw new ApiError(`Network request timed out after ${timeoutMs}ms`, 408);
    }
    throw new ApiError(error.message || 'Network communication failure', 0, error);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches the complete product catalog.
 * @param {object} [options]
 * @returns {Promise<Array<object>>}
 */
export async function getProducts(options = {}) {
  return request('/api/product', { method: 'GET', ...options });
}

/**
 * Fetches detailed technical specifications for a single product.
 * @param {string} id - Product identifier
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function getProductById(id, options = {}) {
  if (!id) {
    throw new ApiError('Product ID is required', 400);
  }
  return request(`/api/product/${id}`, { method: 'GET', ...options });
}

/**
 * Dispatches a cart addition mutation to the remote mock API.
 * @param {{ id: string, colorCode: number, storageCode: number }} payload
 * @param {object} [options]
 * @returns {Promise<{ count: number }>}
 */
export async function postAddToCart(payload, options = {}) {
  if (!payload || !payload.id || payload.colorCode === undefined || payload.storageCode === undefined) {
    throw new ApiError('Cart mutation requires id, colorCode, and storageCode', 400);
  }
  return request('/api/cart', {
    method: 'POST',
    body: JSON.stringify({
      id: payload.id,
      colorCode: payload.colorCode,
      storageCode: payload.storageCode,
    }),
    ...options,
  });
}

export const apiClient = {
  request,
  getProducts,
  getProductById,
  postAddToCart,
};
