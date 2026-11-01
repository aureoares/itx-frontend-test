import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, getProducts, getProductById, postAddToCart, ApiError } from './apiClient';

describe('apiClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('getProducts', () => {
    it('successfully fetches and returns the product catalog', async () => {
      const mockProducts = [
        { id: '1', brand: 'Acer', model: 'Iconia Talk S', price: '170' },
        { id: '2', brand: 'Alcatel', model: 'Flash (2017)', price: '200' },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockProducts),
      });

      const data = await getProducts();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://itx-frontend-test.onrender.com/api/product',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(data).toEqual(mockProducts);
    });
  });

  describe('getProductById', () => {
    it('successfully fetches product details for an existing id', async () => {
      const mockDetail = {
        id: 'device-123',
        brand: 'Apple',
        model: 'iPhone 13',
        price: '800',
        cpu: 'A15',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockDetail),
      });

      const data = await getProductById('device-123');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://itx-frontend-test.onrender.com/api/product/device-123',
        expect.objectContaining({ method: 'GET' })
      );
      expect(data).toEqual(mockDetail);
    });

    it('throws ApiError with status 400 when product id is missing', async () => {
      await expect(getProductById('')).rejects.toThrow(ApiError);
      await expect(getProductById(null)).rejects.toMatchObject({
        status: 400,
        message: 'Product ID is required',
      });
    });
  });

  describe('postAddToCart', () => {
    it('successfully posts cart addition with required parameters', async () => {
      const mockResponse = { count: 1 };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const payload = { id: 'device-123', colorCode: 1000, storageCode: 2000 };
      const response = await postAddToCart(payload);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://itx-frontend-test.onrender.com/api/cart',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
      expect(response).toEqual(mockResponse);
    });

    it('throws ApiError with status 400 if required payload fields are missing', async () => {
      await expect(postAddToCart({ id: '123' })).rejects.toMatchObject({
        status: 400,
        message: 'Cart mutation requires id, colorCode, and storageCode',
      });
    });
  });

  describe('Error handling', () => {
    it('throws ApiError with status 404 when product is not found', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({ message: 'Device not found' }),
      });

      await expect(getProductById('non-existent')).rejects.toMatchObject({
        status: 404,
        message: 'Device not found',
      });
    });

    it('throws ApiError with status 500 when remote server fails', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(getProducts()).rejects.toMatchObject({
        status: 500,
        message: 'HTTP error 500: Internal Server Error',
      });
    });

    it('throws ApiError with status 408 on request timeout', async () => {
      globalThis.fetch = vi.fn().mockImplementation((_url, { signal }) => {
        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            const abortErr = new Error('The operation was aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        });
      });

      await expect(apiClient.request('/api/product', { timeoutMs: 50 })).rejects.toMatchObject({
        status: 408,
        message: expect.stringContaining('timed out after 50ms'),
      });
    });

    it('throws ApiError with status 0 on network disconnect', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(getProducts()).rejects.toMatchObject({
        status: 0,
        message: 'Failed to fetch',
      });
    });
  });
});
