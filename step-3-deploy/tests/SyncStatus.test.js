// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SyncStatus', () => {
  let SyncStatus;
  let mockQueue;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = `<div id="sync-status" class="sync-status sync-idle"></div>`;
    mockQueue = { length: vi.fn(() => 0) };
    const mod = await import('../js/ui/SyncStatus.js');
    SyncStatus = mod.SyncStatus;
  });

  it('shows idle when queue is empty', () => {
    SyncStatus.init(mockQueue);
    SyncStatus._updateIndicator();
    const el = document.getElementById('sync-status');
    expect(el.classList.contains('sync-idle')).toBe(true);
  });

  it('shows pending when queue has items', () => {
    mockQueue.length = vi.fn(() => 3);
    SyncStatus.init(mockQueue);
    SyncStatus._updateIndicator();
    const el = document.getElementById('sync-status');
    expect(el.classList.contains('sync-pending')).toBe(true);
    expect(el.textContent).toContain('3');
  });
});
