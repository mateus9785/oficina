import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// RTL auto-registers this cleanup via the test framework's global afterEach,
// which it can't find here since `globals: false` keeps `afterEach` out of
// globalThis -- register it explicitly instead, or every test after the
// first in a file sees every previously rendered component still mounted.
afterEach(() => {
  cleanup();
});
