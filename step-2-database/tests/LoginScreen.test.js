// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginScreen', () => {
  let LoginScreen;
  let mockSupabase;

  beforeEach(async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, 'localStorage', {
      value: (() => {
        let store = {};
        return {
          getItem: vi.fn((key) => store[key] ?? null),
          setItem: vi.fn((key, value) => { store[key] = String(value); }),
          removeItem: vi.fn((key) => { delete store[key]; }),
          clear: vi.fn(() => { store = {}; }),
          get length() { return Object.keys(store).length; },
          key: vi.fn((index) => Object.keys(store)[index] ?? null),
        };
      })(),
      writable: true,
      configurable: true,
    });

    mockSupabase = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'uuid-123' }, error: null })),
          })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'uuid-123' }, error: null })),
          })),
        })),
      })),
    };

    document.body.innerHTML = `
      <div id="login-screen" style="display:flex">
        <input id="email-input" />
        <input id="screen-name-input" />
        <button id="login-button">Enter</button>
      </div>
      <div id="menu-screen" style="display:none"></div>
    `;

    const mod = await import('../js/auth/LoginScreen.js');
    LoginScreen = mod.LoginScreen;
  });

  it('shows form, hides menu on init', () => {
    LoginScreen.init(mockSupabase);
    expect(document.getElementById('login-screen').style.display).toBe('flex');
    expect(document.getElementById('menu-screen').style.display).toBe('none');
  });

  it('hides login screen on successful login', async () => {
    LoginScreen.init(mockSupabase);
    document.getElementById('email-input').value = 'test@example.com';
    document.getElementById('screen-name-input').value = 'TestPlayer';
    await LoginScreen.submit();
    expect(document.getElementById('login-screen').style.display).toBe('none');
  });
});
