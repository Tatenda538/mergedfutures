import { supabase } from '../supabase/SupabaseClient.js';

export const LeaderboardModal = {
  _currentLevel: null,

  open(level) {
    this._currentLevel = level;
    const modal = document.getElementById('leaderboard-modal');
    if (modal) modal.style.display = 'flex';
    const content = document.getElementById('leaderboard-content');
    if (content) content.innerHTML = '<p>Loading...</p>';
    this._fetchAndRender(level);
  },

  close() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) modal.style.display = 'none';
    this._currentLevel = null;
  },

  async _fetchAndRender(level) {
    const { data, error } = await supabase
      .from('scores')
      .select('time, players ( screen_name )')
      .eq('level', level)
      .order('time', { ascending: true })
      .limit(10);

    const content = document.getElementById('leaderboard-content');
    if (!content) return;

    if (error) {
      content.innerHTML = '<p>Error loading leaderboard</p>';
      return;
    }

    if (!data || data.length === 0) {
      content.innerHTML = '<p>No scores yet</p>';
      return;
    }

    content.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Player</th><th>Time</th></tr></thead>
        <tbody>
          ${data.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.players.screen_name}</td>
              <td>${s.time.toFixed(1)}s</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },
};
