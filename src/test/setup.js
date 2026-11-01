import '@testing-library/jest-dom';

/**
 * Polyfill / normalize global Request in jsdom environment.
 * In Node 22+ and jsdom, Node's built-in undici Request expects its native AbortSignal,
 * whereas jsdom provides window.AbortController with its own AbortSignal instance.
 * When React Router v7 creates a client-side Request during navigation, this causes a TypeError.
 */
if (typeof globalThis.Request !== 'undefined') {
  const OriginalRequest = globalThis.Request;
  globalThis.Request = class Request extends OriginalRequest {
    constructor(input, init) {
      if (init && init.signal) {
        try {
          super(input, init);
          return;
        } catch (err) {
          if (err && err.message && err.message.includes('AbortSignal')) {
            const { signal: _signal, ...restInit } = init;
            super(input, restInit);
            return;
          }
          throw err;
        }
      }
      super(input, init);
    }
  };
}

