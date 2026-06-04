import { GameData } from '../GameData.js';

export class ScoreManager {
  constructor(syncQueue, supabaseClient) {
    this.queue = syncQueue;
    this.supabase = supabaseClient;
  }

  async submitScore(playerId, level, time) {
    const best = GameData.getBestTime(level);
    if (best !== null && time >= best) return;
    this.queue.enqueue({ player_id: playerId, level, time });
  }

  async fetchLeaderboard(level) {
    const { data, error } = await this.supabase
      .from('scores')
      .select('time, players ( screen_name )')
      .eq('level', level)
      .order('time', { ascending: true })
      .limit(10);
    if (error) throw error;
    return data;
  }
}
