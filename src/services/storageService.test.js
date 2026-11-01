import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getItem,
  setItem,
  removeItem,
  clear,
  getEnvelope,
  setEnvelope,
  formatKey,
  _resetStorageState,
} from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetStorageState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    _resetStorageState();
  });

  describe('formatKey', () => {
    it('prepends itx_ namespace prefix if not already present', () => {
      expect(formatKey('cache_products')).toBe('itx_cache_products');
      expect(formatKey('itx_cart_count')).toBe('itx_cart_count');
      expect(formatKey('')).toBe('');
    });
  });

  describe('basic get/set operations', () => {
    it('persists and retrieves serializable objects', () => {
      const data = { id: 'device-1', name: 'Test' };
      const success = setItem('test_key', data);

      expect(success).toBe(true);
      expect(getItem('test_key')).toEqual(data);
      expect(localStorage.getItem('itx_test_key')).toBe(JSON.stringify(data));
    });

    it('returns null when reading non-existent key', () => {
      expect(getItem('non_existent')).toBeNull();
    });

    it('removes keys properly', () => {
      setItem('test_key', 'val');
      removeItem('test_key');
      expect(getItem('test_key')).toBeNull();
      expect(localStorage.getItem('itx_test_key')).toBeNull();
    });

    it('clears all itx_ keys while preserving unrelated keys', () => {
      localStorage.setItem('other_app_key', 'preserve');
      setItem('key1', 'a');
      setItem('key2', 'b');

      clear();

      expect(getItem('key1')).toBeNull();
      expect(getItem('key2')).toBeNull();
      expect(localStorage.getItem('other_app_key')).toBe('preserve');
    });
  });

  describe('envelope operations', () => {
    it('stores and retrieves timestamped envelopes', () => {
      const mockTimestamp = 1700000000000;
      const testData = [{ id: '1', model: 'Device' }];

      setEnvelope('cache_products', testData, mockTimestamp);

      const envelope = getEnvelope('cache_products');
      expect(envelope).toEqual({
        timestamp: mockTimestamp,
        data: testData,
      });
    });

    it('purges and returns null when envelope has invalid timestamp', () => {
      localStorage.setItem('itx_bad_env', JSON.stringify({ timestamp: 'invalid', data: [1] }));

      expect(getEnvelope('bad_env')).toBeNull();
      expect(localStorage.getItem('itx_bad_env')).toBeNull();
    });

    it('returns null if stored value is not an object', () => {
      localStorage.setItem('itx_primitive', JSON.stringify('just a string'));
      expect(getEnvelope('primitive')).toBeNull();
    });
  });

  describe('resilience and recovery', () => {
    it('handles corrupted malformed JSON safely by removing the entry and returning null', () => {
      localStorage.setItem('itx_corrupted_key', '{ malformed json: not valid ...');

      const result = getItem('corrupted_key');

      expect(result).toBeNull();
      expect(localStorage.getItem('itx_corrupted_key')).toBeNull();
    });

    it('activates in-memory fallback when localStorage throws QuotaExceededError', () => {
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      const data = { device: 'overflow-payload' };
      const writeSuccess = setItem('quota_test', data);

      expect(writeSuccess).toBe(true);
      expect(getItem('quota_test')).toEqual(data);
    });

    it('activates in-memory fallback when localStorage is disabled or throws SecurityError', () => {
      const securityError = new DOMException('Storage is disabled', 'SecurityError');
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw securityError;
      });

      // Write before read triggers fallback
      setItem('sec_test', 'persisted_in_memory');
      expect(getItem('sec_test')).toBe('persisted_in_memory');
    });
  });
});
