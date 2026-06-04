const STORAGE_KEY = 'asteroids_player';

export const AuthManager = {
  async hashEmail(email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  savePlayer(player) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  },

  loadPlayer() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearPlayer() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
