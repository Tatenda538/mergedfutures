import { AuthManager } from './AuthManager.js';

export const LoginScreen = {
  _supabase: null,

  init(supabaseClient) {
    this._supabase = supabaseClient;
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('menu-screen').style.display = 'none';

    document.getElementById('login-button').addEventListener('click', () => {
      this.submit();
    });
  },

  async submit() {
    const email = document.getElementById('email-input').value.trim();
    const screenName = document.getElementById('screen-name-input').value.trim();
    if (!email || !screenName) return;

    const hashedId = await AuthManager.hashEmail(email);

    const { data, error } = await this._supabase
      .from('players')
      .upsert({ hashed_id: hashedId, screen_name: screenName }, { onConflict: 'hashed_id' })
      .select('id')
      .single();

    if (error) {
      console.error('Login error:', error);
      return;
    }

    AuthManager.savePlayer({ hashedId, screenName, id: data.id });

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    if (window.afterLogin) window.afterLogin();
  },
};
