import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '../js/supabase/ScoreManager.js';

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

describe('ScoreManager', () => {
  let manager;
  let mockQueue;
  let mockSupabase;

  beforeEach(() => {
    localStorage.clear();

    mockQueue = { enqueue: vi.fn() };
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        upsert: vi.fn(),
      })),
    };

    localStorage.setItem('asteroids_times', JSON.stringify({ '1': 50.0, '2': 30.0 }));
    manager = new ScoreManager(mockQueue, mockSupabase);
  });

  it('enqueues score if it is a new personal best', async () => {
    await manager.submitScore('player-uuid', 1, 45.2);
    expect(mockQueue.enqueue).toHaveBeenCalledWith({
      player_id: 'player-uuid',
      level: 1,
      time: 45.2,
    });
  });

  it('does not enqueue if time is not a new personal best', async () => {
    await manager.submitScore('player-uuid', 1, 55.0);
    expect(mockQueue.enqueue).not.toHaveBeenCalled();
  });

  it('enqueues if no existing local best for that level', async () => {
    await manager.submitScore('player-uuid', 99, 10.0);
    expect(mockQueue.enqueue).toHaveBeenCalled();
  });
});
