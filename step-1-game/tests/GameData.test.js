import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameData } from '../js/GameData.js';

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

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMockStorage(),
    writable: true,
    configurable: true,
  });
});

describe('GameData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns unlocked level 1 by default', () => {
    expect(GameData.getUnlockedLevel()).toBe(1);
  });

  it('stores completed level time and unlocks next', () => {
    GameData.completeLevel(1, 45.2);
    expect(GameData.getUnlockedLevel()).toBe(2);
    expect(GameData.getBestTime(1)).toBe(45.2);
  });

  it('only updates best time if new time is lower', () => {
    GameData.completeLevel(1, 45.2);
    GameData.completeLevel(1, 60.0);
    expect(GameData.getBestTime(1)).toBe(45.2);
    GameData.completeLevel(1, 30.0);
    expect(GameData.getBestTime(1)).toBe(30.0);
  });

  it('returns null for uncompleted level best time', () => {
    expect(GameData.getBestTime(99)).toBeNull();
  });

  it('does not decrease unlocked level', () => {
    GameData.completeLevel(3, 10.0);
    expect(GameData.getUnlockedLevel()).toBe(4);
    GameData.completeLevel(1, 5.0);
    expect(GameData.getUnlockedLevel()).toBe(4);
  });
});
