import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('SupabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    const mockFrom = vi.fn();
    globalThis.supabase = {
      createClient: vi.fn(() => ({ from: mockFrom })),
    };
  });

  it('creates a supabase client on first access', async () => {
    const { supabase } = await import('../js/supabase/SupabaseClient.js');
    const client = supabase;
    expect(client).toBeDefined();
    expect(globalThis.supabase.createClient).toHaveBeenCalled();
  });

  it('returns the same client instance on repeated access', async () => {
    const mod = await import('../js/supabase/SupabaseClient.js');
    const client1 = mod.supabase;
    const client2 = mod.supabase;
    expect(client1).toBe(client2);
  });
});
