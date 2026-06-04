import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncQueue } from '../js/supabase/SyncQueue.js';

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

describe('SyncQueue', () => {
  let queue;
  let mockFlushFn;

  beforeEach(() => {
    localStorage.clear();
    mockFlushFn = vi.fn();
    queue = new SyncQueue(mockFlushFn);
  });

  it('starts empty', () => {
    expect(queue.length()).toBe(0);
  });

  it('enqueues items', () => {
    queue.enqueue({ level: 1, time: 45.2 });
    expect(queue.length()).toBe(1);
  });

  it('returns pending items and clears queue on flush', () => {
    queue.enqueue({ level: 1, time: 45.2 });
    const items = queue.flush();
    expect(items).toEqual([{ level: 1, time: 45.2 }]);
    expect(queue.length()).toBe(0);
  });

  it('calls flush callback when autoFlush triggered', async () => {
    queue.enqueue({ level: 1, time: 45.2 });
    await queue.triggerFlush();
    expect(mockFlushFn).toHaveBeenCalledWith([{ level: 1, time: 45.2 }]);
  });

  it('re-queues items on failed flush callback', async () => {
    mockFlushFn.mockImplementation(() => { throw new Error('network error'); });
    queue.enqueue({ level: 1, time: 45.2 });
    await queue.triggerFlush();
    expect(queue.length()).toBe(1);
  });

  it('persists queue to localStorage', () => {
    queue.enqueue({ level: 1, time: 45.2 });
    const stored = JSON.parse(localStorage.getItem('asteroids_sync_queue'));
    expect(stored).toEqual([{ level: 1, time: 45.2 }]);
  });

  it('restores queue from localStorage on creation', () => {
    localStorage.setItem('asteroids_sync_queue', JSON.stringify([{ level: 1, time: 45.2 }]));
    const q2 = new SyncQueue(mockFlushFn);
    expect(q2.length()).toBe(1);
  });
});
