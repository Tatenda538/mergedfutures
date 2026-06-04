// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LeaderboardModal', () => {
  let LeaderboardModal;

  beforeEach(async () => {
    vi.resetModules();
    globalThis.supabase = {
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
          upsert: vi.fn(),
        })),
      })),
    };

    document.body.innerHTML = `
      <div id="leaderboard-modal" style="display:none">
        <div id="leaderboard-content"></div>
        <button id="leaderboard-close">Close</button>
      </div>
    `;
    const mod = await import('../js/ui/LeaderboardModal.js');
    LeaderboardModal = mod.LeaderboardModal;
  });

  it('opens modal and shows loading state', () => {
    LeaderboardModal.open(1);
    expect(document.getElementById('leaderboard-modal').style.display).toBe('flex');
    expect(document.getElementById('leaderboard-content').textContent).toContain('Loading');
  });

  it('closes modal', () => {
    LeaderboardModal.open(1);
    LeaderboardModal.close();
    expect(document.getElementById('leaderboard-modal').style.display).toBe('none');
  });
});
