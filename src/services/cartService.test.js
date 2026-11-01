import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getStoredCartCount,
  setStoredCartCount,
  addDeviceToCart,
  resetCart,
} from './cartService';
import { apiClient } from './apiClient';
import { _resetStorageState } from './storageService';

describe('cartService', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetStorageState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    _resetStorageState();
  });

  describe('getStoredCartCount & setStoredCartCount', () => {
    it('returns 0 when nothing is stored', () => {
      expect(getStoredCartCount()).toBe(0);
    });

    it('persists and returns accumulated count', () => {
      setStoredCartCount(5);
      expect(getStoredCartCount()).toBe(5);
      expect(localStorage.getItem('itx_cart_count')).toBe('5');
    });

    it('clamps negative numbers or non-numeric inputs to 0', () => {
      setStoredCartCount(-3);
      expect(getStoredCartCount()).toBe(0);

      localStorage.setItem('itx_cart_count', 'invalid');
      expect(getStoredCartCount()).toBe(0);
    });
  });

  describe('addDeviceToCart', () => {
    it('dispatches mutation to remote API and accumulates count upon confirmation', async () => {
      setStoredCartCount(1);

      const apiSpy = vi.spyOn(apiClient, 'postAddToCart').mockResolvedValue({ count: 1 });
      const payload = { id: 'device-101', colorCode: 1000, storageCode: 2000 };

      const result = await addDeviceToCart(payload);

      expect(apiSpy).toHaveBeenCalledWith(payload, {});
      expect(result.totalCount).toBe(2);
      expect(result.apiResponse).toEqual({ count: 1 });
      expect(getStoredCartCount()).toBe(2);
    });

    it('propagates API error and does NOT increment count if API fails', async () => {
      setStoredCartCount(1);

      vi.spyOn(apiClient, 'postAddToCart').mockRejectedValue(new Error('Server Error'));

      await expect(
        addDeviceToCart({ id: 'device-101', colorCode: 1, storageCode: 2 })
      ).rejects.toThrow('Server Error');

      expect(getStoredCartCount()).toBe(1);
    });
  });

  describe('resetCart', () => {
    it('resets count back to 0', () => {
      setStoredCartCount(7);
      resetCart();
      expect(getStoredCartCount()).toBe(0);
    });
  });
});
