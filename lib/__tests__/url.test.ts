import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBaseUrl } from '../url';

describe('getBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns empty string on client side', () => {
    // Simulate window existence
    vi.stubGlobal('window', {});
    expect(getBaseUrl()).toBe('');
    vi.stubGlobal('window', undefined); // Reset
  });
});

