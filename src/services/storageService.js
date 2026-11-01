const KEY_PREFIX = 'itx_';
const memoryStore = new Map();
let isFallbackActive = false;

/**
 * Checks whether localStorage is accessible in the current execution context.
 * @returns {boolean}
 */
function checkStorageAvailability() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    const testKey = `${KEY_PREFIX}__test__`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures a key has the standardized 'itx_' namespace prefix.
 * @param {string} key
 * @returns {string}
 */
export function formatKey(key) {
  if (!key) return '';
  return key.startsWith(KEY_PREFIX) ? key : `${KEY_PREFIX}${key}`;
}

/**
 * Retrieves a stored value by key. Recovers automatically from corrupted JSON.
 * @param {string} key
 * @returns {any | null}
 */
export function getItem(key) {
  const formattedKey = formatKey(key);

  if (isFallbackActive || !checkStorageAvailability()) {
    return memoryStore.has(formattedKey) ? memoryStore.get(formattedKey) : null;
  }

  try {
    const rawValue = window.localStorage.getItem(formattedKey);
    if (rawValue === null) {
      return null;
    }
    try {
      return JSON.parse(rawValue);
    } catch {
      // Corrupted JSON detected — purge immediately and safely return null
      window.localStorage.removeItem(formattedKey);
      return null;
    }
  } catch {
    // If accessing localStorage throws (SecurityError / private mode), fall back to memory
    isFallbackActive = true;
    return memoryStore.has(formattedKey) ? memoryStore.get(formattedKey) : null;
  }
}

/**
 * Persists a value under the given key. Falls back to in-memory store upon QuotaExceededError.
 * @param {string} key
 * @param {any} value
 * @returns {boolean} True if persisted (via storage or fallback)
 */
export function setItem(key, value) {
  const formattedKey = formatKey(key);

  if (isFallbackActive || !checkStorageAvailability()) {
    memoryStore.set(formattedKey, value);
    return true;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(formattedKey, serialized);
    // Mirror in memory store for session continuity
    memoryStore.set(formattedKey, value);
    return true;
  } catch {
    // QuotaExceededError or restricted context: activate in-memory fallback
    isFallbackActive = true;
    memoryStore.set(formattedKey, value);
    return true;
  }
}

/**
 * Removes an item from both localStorage and the memory fallback.
 * @param {string} key
 */
export function removeItem(key) {
  const formattedKey = formatKey(key);
  memoryStore.delete(formattedKey);
  try {
    if (checkStorageAvailability()) {
      window.localStorage.removeItem(formattedKey);
    }
  } catch {
    // Ignore removal errors
  }
}

/**
 * Clears all application-namespaced items.
 */
export function clear() {
  memoryStore.clear();
  try {
    if (checkStorageAvailability()) {
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(KEY_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
  } catch {
    // Ignore
  }
}

/**
 * Reads a timestamped cache envelope { timestamp, data }.
 * @param {string} key
 * @returns {{ timestamp: number, data: any } | null}
 */
export function getEnvelope(key) {
  const envelope = getItem(key);
  if (!envelope || typeof envelope !== 'object') {
    return null;
  }
  if (typeof envelope.timestamp !== 'number' || Number.isNaN(envelope.timestamp)) {
    removeItem(key);
    return null;
  }
  return envelope;
}

/**
 * Writes a timestamped cache envelope { timestamp, data }.
 * @param {string} key
 * @param {any} data
 * @param {number} [timestamp] Defaults to Date.now()
 * @returns {boolean}
 */
export function setEnvelope(key, data, timestamp = Date.now()) {
  return setItem(key, {
    timestamp,
    data,
  });
}

/**
 * Testing helper: resets internal memory fallback state.
 */
export function _resetStorageState() {
  memoryStore.clear();
  isFallbackActive = false;
}

export const storageService = {
  formatKey,
  getItem,
  setItem,
  removeItem,
  clear,
  getEnvelope,
  setEnvelope,
  _resetStorageState,
};
