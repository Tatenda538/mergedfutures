import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthManager', () => {
  let AuthManager;

  function createMockStorage() {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = String(value); }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((index) => Object.keys(store)[index] ?? null),
    };
  }

  beforeEach(async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMockStorage(),
      writable: true,
      configurable: true,
    });
    const mod = await import('../js/auth/AuthManager.js');
    AuthManager = mod.AuthManager;
  });

  it('hashes email to a hex string', async () => {
    const hash = await AuthManager.hashEmail('test@example.com');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('returns consistent hash for same email', async () => {
    const h1 = await AuthManager.hashEmail('test@example.com');
    const h2 = await AuthManager.hashEmail('test@example.com');
    expect(h1).toBe(h2);
  });

  it('stores player in localStorage', () => {
    AuthManager.savePlayer({ hashedId: 'abc', screenName: 'Test' });
    const stored = JSON.parse(localStorage.getItem('asteroids_player'));
    expect(stored).toEqual({ hashedId: 'abc', screenName: 'Test' });
  });

  it('loads player from localStorage', () => {
    localStorage.setItem('asteroids_player', JSON.stringify({ hashedId: 'abc', screenName: 'Test' }));
    const player = AuthManager.loadPlayer();
    expect(player).toEqual({ hashedId: 'abc', screenName: 'Test' });
  });

  it('returns null if no stored player', () => {
    expect(AuthManager.loadPlayer()).toBeNull();
  });

  it('clears stored player', () => {
    AuthManager.savePlayer({ hashedId: 'abc', screenName: 'Test' });
    AuthManager.clearPlayer();
    expect(AuthManager.loadPlayer()).toBeNull();
  });
});
