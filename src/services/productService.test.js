import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getProducts, getProductById, clearProductCache, CACHE_TTL_MS } from './productService';
import { apiClient } from './apiClient';
import { storageService, _resetStorageState } from './storageService';

describe('productService (1-Hour TTL Caching)', () => {
  const BASE_TIME = 1730460000000; // Fixed deterministic timestamp

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
    localStorage.clear();
    _resetStorageState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    _resetStorageState();
  });

  describe('getProducts', () => {
    it('fetches from API and populates cache on initial cold request', async () => {
      const mockCatalog = [
        { id: 'dev-1', brand: 'Acer', model: 'Model A' },
        { id: 'dev-2', brand: 'Alcatel', model: 'Model B' },
      ];
      const apiSpy = vi.spyOn(apiClient, 'getProducts').mockResolvedValue(mockCatalog);

      const result = await getProducts();

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCatalog);

      // Verify envelope in storage
      const envelope = storageService.getEnvelope('cache_products');
      expect(envelope).toEqual({
        timestamp: BASE_TIME,
        data: mockCatalog,
      });
    });

    it('serves from cache without remote API request within 1-hour window (e.g. 59 minutes later)', async () => {
      const initialCatalog = [{ id: 'dev-1', model: 'Cached Model' }];
      storageService.setEnvelope('cache_products', initialCatalog, BASE_TIME);

      const apiSpy = vi.spyOn(apiClient, 'getProducts');

      // Advance time by 59 minutes (3,540,000 ms < 3,600,000 ms)
      vi.advanceTimersByTime(59 * 60 * 1000);

      const result = await getProducts();

      expect(apiSpy).not.toHaveBeenCalled();
      expect(result).toEqual(initialCatalog);
    });

    it('revalidates against API when cache expires after 1 hour (e.g. 61 minutes later)', async () => {
      const staleCatalog = [{ id: 'stale-1', model: 'Old Model' }];
      const freshCatalog = [{ id: 'fresh-1', model: 'Fresh Model' }];

      storageService.setEnvelope('cache_products', staleCatalog, BASE_TIME);
      const apiSpy = vi.spyOn(apiClient, 'getProducts').mockResolvedValue(freshCatalog);

      // Advance time by 61 minutes (3,660,000 ms > 3,600,000 ms)
      vi.advanceTimersByTime(61 * 60 * 1000);
      const revalidationTime = BASE_TIME + 61 * 60 * 1000;

      const result = await getProducts();

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(freshCatalog);

      // Verify envelope updated with new timestamp and data
      const updatedEnvelope = storageService.getEnvelope('cache_products');
      expect(updatedEnvelope.timestamp).toBe(revalidationTime);
      expect(updatedEnvelope.data).toEqual(freshCatalog);
    });

    it('bypasses valid cache when forceRefresh option is true', async () => {
      const initialCatalog = [{ id: 'dev-1', model: 'Initial' }];
      const refreshedCatalog = [{ id: 'dev-1', model: 'Refreshed' }];

      storageService.setEnvelope('cache_products', initialCatalog, BASE_TIME);
      const apiSpy = vi.spyOn(apiClient, 'getProducts').mockResolvedValue(refreshedCatalog);

      // Time is within 1 hour, but forceRefresh is requested
      vi.advanceTimersByTime(10 * 60 * 1000);

      const result = await getProducts({ forceRefresh: true });

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(refreshedCatalog);
    });
  });

  describe('getProductById', () => {
    it('fetches and caches product details for a specific device', async () => {
      const mockDetail = { id: 'device-xyz', brand: 'TestBrand', price: '499' };
      const apiSpy = vi.spyOn(apiClient, 'getProductById').mockResolvedValue(mockDetail);

      const result = await getProductById('device-xyz');

      expect(apiSpy).toHaveBeenCalledWith('device-xyz', expect.any(Object));
      expect(result).toEqual(mockDetail);

      const envelope = storageService.getEnvelope('cache_product_device-xyz');
      expect(envelope).toEqual({
        timestamp: BASE_TIME,
        data: mockDetail,
      });
    });

    it('serves cached device specifications on subsequent requests within 1 hour', async () => {
      const cachedDetail = { id: 'device-xyz', brand: 'CachedBrand' };
      storageService.setEnvelope('cache_product_device-xyz', cachedDetail, BASE_TIME);

      const apiSpy = vi.spyOn(apiClient, 'getProductById');

      vi.advanceTimersByTime(30 * 60 * 1000); // 30 minutes later

      const result = await getProductById('device-xyz');

      expect(apiSpy).not.toHaveBeenCalled();
      expect(result).toEqual(cachedDetail);
    });

    it('revalidates device details when cache exceeds 1-hour TTL', async () => {
      const oldDetail = { id: 'device-xyz', price: '500' };
      const newDetail = { id: 'device-xyz', price: '450' };

      storageService.setEnvelope('cache_product_device-xyz', oldDetail, BASE_TIME);
      const apiSpy = vi.spyOn(apiClient, 'getProductById').mockResolvedValue(newDetail);

      vi.advanceTimersByTime(CACHE_TTL_MS + 1000); // 1 hour + 1s

      const result = await getProductById('device-xyz');

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(newDetail);
    });

    it('throws error when product id is missing', async () => {
      await expect(getProductById('')).rejects.toThrow('Product ID is required');
    });
  });

  describe('clearProductCache', () => {
    it('removes catalog cache when no id specified', () => {
      storageService.setEnvelope('cache_products', [1]);
      clearProductCache();
      expect(storageService.getEnvelope('cache_products')).toBeNull();
    });

    it('removes specific device cache when id is provided', () => {
      storageService.setEnvelope('cache_product_abc', { id: 'abc' });
      clearProductCache('abc');
      expect(storageService.getEnvelope('cache_product_abc')).toBeNull();
    });
  });
});
