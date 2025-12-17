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

  it('returns NEXTAUTH_URL if set', () => {
    process.env.NEXTAUTH_URL = 'https://example.com';
    expect(getBaseUrl()).toBe('https://example.com');
  });

  it('returns VERCEL_URL if NEXTAUTH_URL is not set', () => {
    delete process.env.NEXTAUTH_URL;
    process.env.VERCEL_URL = 'vercel-app.com';
    expect(getBaseUrl()).toBe('https://vercel-app.com');
  });

  it('defaults to localhost', () => {
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });
});

