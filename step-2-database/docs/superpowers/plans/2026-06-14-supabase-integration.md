# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Asteroids game to Supabase for player identity, progress tracking, and global leaderboards.

**Architecture:** Four new modules (SupabaseClient, SyncQueue, ScoreManager, LoginScreen, LeaderboardModal, SyncStatus) layered on top of existing GameData localStorage approach. Supabase URL and anon key in a config module loaded by all components. Background sync queue flushed every 5 seconds.

**Tech Stack:** Supabase (Postgres + REST API via `@supabase/supabase-js` from CDN), Phaser 3.80.1 (existing), Vitest (existing)

---

### Task 1: Database schema (Supabase migration)

**Files:**
- Create: `supabase/migrations/20260614001_create_tables.sql` (via MCP)

- [ ] **Step 1: Apply migration to create tables**

Run the Supabase MCP tool to apply the migration:

```sql
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hashed_id text UNIQUE NOT NULL,
  screen_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level smallint NOT NULL,
  time real NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (player_id, level)
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players"
  ON players FOR SELECT USING (true);

CREATE POLICY "Anyone can insert players"
  ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read scores"
  ON scores FOR SELECT USING (true);

CREATE POLICY "Anyone can insert scores"
  ON scores FOR INSERT WITH CHECK (true);
```

- [ ] **Step 2: Verify tables exist**

Run: `supabase_list_tables` for project `bimxzxpamkrxdvieltsk`, schema `public`, verbose.

---

### Task 2: Project environment setup

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Install supabase-js CDN in index.html**

In `index.html`, add the script tag before the `main.js` module script:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.env
```

- [ ] **Step 3: Create `.env.example`**

```
VITE_SUPABASE_URL=https://bimxzxpamkrxdvieltsk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] **Step 4: Install @supabase/supabase-js as dev dependency (for type hints)**

Run: `npm install -D @supabase/supabase-js`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example index.html
git commit -m "chore: add supabase deps and env config"
```

---

### Task 3: SupabaseClient module

**Files:**
- Create: `js/supabase/SupabaseClient.js`
- Create: `tests/SupabaseClient.test.js`

This module initializes the Supabase client using the global `supabase` UMD object and the config values.

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SupabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up a fake global supabase
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/SupabaseClient.test.js`
Expected: FAIL with import errors

- [ ] **Step 3: Write minimal implementation**

```javascript
let _client = null;

function initClient() {
  if (_client) return _client;
  _client = supabase.createClient(
    'https://bimxzxpamkrxdvieltsk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbXh6eHBhbWtyeGR2aWVsdHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjAyMzAsImV4cCI6MjA5NzAzNjIzMH0.U4r48YoQM5-1Nouz227tgfMTvvgBPEv6X0-35pycWvI'
  );
  return _client;
}

export const supabase = initClient();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/supabase/SupabaseClient.js tests/SupabaseClient.test.js
git commit -m "feat: add SupabaseClient module"
```

---

### Task 4: SyncQueue module

**Files:**
- Create: `js/supabase/SyncQueue.js`
- Create: `tests/SyncQueue.test.js`

A background sync queue that holds pending score writes, persists to localStorage, and flushes periodically.

- [ ] **Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncQueue } from '../js/supabase/SyncQueue.js';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/SyncQueue.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
const STORAGE_KEY = 'asteroids_sync_queue';

export class SyncQueue {
  constructor(flushFn) {
    this.flushFn = flushFn;
    this.queue = this._load();
  }

  _load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
  }

  length() {
    return this.queue.length;
  }

  enqueue(item) {
    this.queue.push(item);
    this._save();
  }

  flush() {
    const items = [...this.queue];
    this.queue = [];
    this._save();
    return items;
  }

  async triggerFlush() {
    if (this.queue.length === 0) return;
    const items = this.flush();
    try {
      await this.flushFn(items);
    } catch {
      this.queue = [...items, ...this.queue];
      this._save();
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/SyncQueue.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/supabase/SyncQueue.js tests/SyncQueue.test.js
git commit -m "feat: add SyncQueue for background sync"
```

---

### Task 5: ScoreManager module

**Files:**
- Create: `js/supabase/ScoreManager.js`
- Create: `tests/ScoreManager.test.js`

Manages score syncing: determines if a time is a personal best, enqueues for sync.

- [ ] **Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '../js/supabase/ScoreManager.js';

describe('ScoreManager', () => {
  let manager;
  let mockQueue;
  let mockSupabase;

  beforeEach(() => {
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
    // Set up localStorage with existing best time
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/ScoreManager.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/ScoreManager.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/supabase/ScoreManager.js tests/ScoreManager.test.js
git commit -m "feat: add ScoreManager for sync decisions"
```

---

### Task 6: Auth/Login module

**Files:**
- Create: `js/auth/AuthManager.js`
- Create: `tests/AuthManager.test.js`

Handles SHA-256 hashing, localStorage persistence, and Supabase player upsert.

- [ ] **Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthManager', () => {
  let AuthManager;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    const mod = await import('../js/auth/AuthManager.js');
    AuthManager = mod.AuthManager;
  });

  it('hashes email to a hex string', async () => {
    const hash = await AuthManager.hashEmail('test@example.com');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('returns consistent hash for same email', async () => {
    const h1 = await AuthManager.hashEmail('test@example.com');
    const h2 = await AuthManager.hashEmail('test@example.com');
    expect(h1).toBe(h2);
  });

  it('stores player in localStorage', () => {
    AuthManager.savePlayer({ hashedId: 'abc', screenName: 'Test' });
    const stored = JSON.parse(localStorage.getItem('asteroids_player'));
    expect(stored).toEqual({ hashedId: 'abc', screenName: 'Test' });
  });

  it('loads player from localStorage', () => {
    localStorage.setItem('asteroids_player', JSON.stringify({ hashedId: 'abc', screenName: 'Test' }));
    const player = AuthManager.loadPlayer();
    expect(player).toEqual({ hashedId: 'abc', screenName: 'Test' });
  });

  it('returns null if no stored player', () => {
    expect(AuthManager.loadPlayer()).toBeNull();
  });

  it('clears stored player', () => {
    AuthManager.savePlayer({ hashedId: 'abc', screenName: 'Test' });
    AuthManager.clearPlayer();
    expect(AuthManager.loadPlayer()).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/AuthManager.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/AuthManager.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/auth/AuthManager.js tests/AuthManager.test.js
git commit -m "feat: add AuthManager for player identity"
```

---

### Task 7: LoginScreen UI

**Files:**
- Create: `js/auth/LoginScreen.js`
- Create: `tests/LoginScreen.test.js`

Manages the login form (email + screen name), submits to Supabase upsert, transitions to level select.

- [ ] **Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginScreen', () => {
  let LoginScreen;
  let mockSupabase;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();

    mockSupabase = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ data: { id: 'uuid-123' }, error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'uuid-123' }, error: null })),
          })),
        })),
      })),
    };

    // Set up DOM
    document.body.innerHTML = `
      <div id="login-screen" style="display:flex">
        <input id="email-input" />
        <input id="screen-name-input" />
        <button id="login-button">Enter</button>
      </div>
      <div id="menu-screen" style="display:none"></div>
    `;

    const mod = await import('../js/auth/LoginScreen.js');
    LoginScreen = mod.LoginScreen;
  });

  it('shows form, hides menu on init', () => {
    LoginScreen.init(mockSupabase);
    expect(document.getElementById('login-screen').style.display).toBe('flex');
    expect(document.getElementById('menu-screen').style.display).toBe('none');
  });

  it('hides login screen on successful login', async () => {
    LoginScreen.init(mockSupabase);
    document.getElementById('email-input').value = 'test@example.com';
    document.getElementById('screen-name-input').value = 'TestPlayer';
    await LoginScreen.submit();
    expect(document.getElementById('login-screen').style.display).toBe('none');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/LoginScreen.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
import { AuthManager } from './AuthManager.js';
import { supabase } from '../supabase/SupabaseClient.js';

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
      .upsert({ hashed_id: hashedId, screen_name: screenName })
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/LoginScreen.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/auth/LoginScreen.js tests/LoginScreen.test.js
git commit -m "feat: add LoginScreen UI"
```

---

### Task 8: LeaderboardModal UI

**Files:**
- Create: `js/ui/LeaderboardModal.js`
- Create: `tests/LeaderboardModal.test.js`

Modal overlay showing top 10 scores for a given level.

- [ ] **Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LeaderboardModal', () => {
  let LeaderboardModal;

  beforeEach(async () => {
    vi.resetModules();
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/LeaderboardModal.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
import { supabase } from '../supabase/SupabaseClient.js';

export const LeaderboardModal = {
  _currentLevel: null,

  open(level) {
    this._currentLevel = level;
    document.getElementById('leaderboard-modal').style.display = 'flex';
    const content = document.getElementById('leaderboard-content');
    content.innerHTML = '<p>Loading...</p>';
    this._fetchAndRender(level);
  },

  close() {
    document.getElementById('leaderboard-modal').style.display = 'none';
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/LeaderboardModal.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/ui/LeaderboardModal.js tests/LeaderboardModal.test.js
git commit -m "feat: add LeaderboardModal"
```

---

### Task 9: SyncStatus UI

**Files:**
- Create: `js/ui/SyncStatus.js`
- Create: `tests/SyncStatus.test.js`

Small status indicator in the top-right corner of the level-select screen.

- [ ] **Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SyncStatus', () => {
  let SyncStatus;
  let mockQueue;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = `<div id="sync-status" class="sync-idle"></div>`;
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/SyncStatus.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
export const SyncStatus = {
  _queue: null,
  _interval: null,

  init(syncQueue) {
    this._queue = syncQueue;
    this._updateIndicator();
    this._interval = setInterval(() => this._updateIndicator(), 2000);
  },

  _updateIndicator() {
    const el = document.getElementById('sync-status');
    if (!el) return;
    const len = this._queue.length();
    el.className = 'sync-status';
    if (len === 0) {
      el.classList.add('sync-idle');
      el.textContent = '●';
    } else {
      el.classList.add('sync-pending');
      el.textContent = `● ${len}`;
    }
  },

  destroy() {
    if (this._interval) clearInterval(this._interval);
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/SyncStatus.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/ui/SyncStatus.js tests/SyncStatus.test.js
git commit -m "feat: add SyncStatus indicator"
```

---

### Task 10: Wire everything in main.js + HTML + CSS

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `js/main.js`

- [ ] **Step 1: Update index.html with login screen, leaderboard modal, and sync status**

Add login screen before `#menu-screen`, leaderboard modal before game screen, and sync status inside menu screen:

```html
<div id="login-screen" style="display:flex">
  <div id="login-box">
    <h2>ENTER THE ASTEROID FIELD</h2>
    <input id="email-input" type="email" placeholder="Email" autocomplete="email">
    <input id="screen-name-input" type="text" placeholder="Screen Name" autocomplete="off">
    <button id="login-button">ENTER</button>
  </div>
</div>

<div id="menu-screen" style="display:none">
  <div id="sync-status" class="sync-status sync-idle">●</div>
  <button id="logout-button">LOG OUT</button>
  <h1 id="title">ASTEROIDS</h1>
  <div id="level-grid"></div>
</div>

<div id="game-screen" style="display:none;"></div>

<div id="leaderboard-modal" style="display:none">
  <div id="leaderboard-modal-content">
    <h2>TOP 10 - LEVEL <span id="leaderboard-level"></span></h2>
    <div id="leaderboard-content">Loading...</div>
    <button id="leaderboard-close">Close</button>
  </div>
</div>
```

- [ ] **Step 2: Update style.css with new styles**

Append to the bottom of `style.css`:

```css
#login-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

#login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border: 1px solid #00ffff66;
  border-radius: 8px;
  background: #0a0a1a;
}

#login-box h2 {
  font-size: 1.2rem;
  text-shadow: 0 0 10px #00ffff;
  margin-bottom: 0.5rem;
}

#login-box input {
  background: #0a0a1a;
  border: 1px solid #00ffff66;
  color: #00ffff;
  padding: 0.5rem 1rem;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  width: 250px;
  outline: none;
}

#login-box input:focus {
  border-color: #00ffff;
  box-shadow: 0 0 8px #00ffff66;
}

#login-button {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.5rem 2rem;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

#login-button:hover {
  background: #00ffff22;
  box-shadow: 0 0 12px #00ffff;
}

.level-cell .leaderboard-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.6rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.level-cell .leaderboard-icon:hover {
  opacity: 1;
}

.level-cell {
  position: relative;
}

#sync-status {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
}

#logout-button {
  position: absolute;
  top: 10px;
  left: 10px;
  background: transparent;
  border: 1px solid #ff00ff66;
  color: #ff00ff;
  padding: 0.3rem 0.8rem;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

#logout-button:hover {
  background: #ff00ff22;
  border-color: #ff00ff;
}

.sync-idle {
  color: #00ff00;
}

.sync-pending {
  color: #ffaa00;
}

#leaderboard-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

#leaderboard-modal-content {
  background: #0a0a1a;
  border: 1px solid #00ffff66;
  border-radius: 8px;
  padding: 2rem;
  min-width: 350px;
  max-width: 500px;
}

#leaderboard-modal-content h2 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #00ffff;
}

#leaderboard-content {
  margin-bottom: 1rem;
}

#leaderboard-content table {
  width: 100%;
  border-collapse: collapse;
}

#leaderboard-content th,
#leaderboard-content td {
  padding: 0.3rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #00ffff22;
}

#leaderboard-content th {
  color: #00ffff88;
  font-size: 0.8rem;
}

#leaderboard-content td:first-child {
  width: 2rem;
  color: #00ffff88;
}

#leaderboard-content td:nth-child(2) {
  color: #00ffff;
}

#leaderboard-content td:last-child {
  text-align: right;
  color: #ff00ff;
}

#leaderboard-close {
  display: block;
  margin: 0 auto;
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.4rem 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

#leaderboard-close:hover {
  background: #00ffff22;
}
```

- [ ] **Step 3: Update main.js to wire up login flow, leaderboard, and sync**

```javascript
import { GameScene } from './scenes/GameScene.js';
import { GameData } from './GameData.js';
import { supabase } from './supabase/SupabaseClient.js';
import { SyncQueue } from './supabase/SyncQueue.js';
import { ScoreManager } from './supabase/ScoreManager.js';
import { AuthManager } from './auth/AuthManager.js';
import { LoginScreen } from './auth/LoginScreen.js';
import { LeaderboardModal } from './ui/LeaderboardModal.js';
import { SyncStatus } from './ui/SyncStatus.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-screen',
  backgroundColor: '#0a0a1a',
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
window.__game = game;

const syncQueue = new SyncQueue(async (items) => {
  for (const item of items) {
    const { error } = await supabase.from('scores').upsert(item, {
      onConflict: 'player_id, level',
    });
    if (error) throw error;
  }
});

const scoreManager = new ScoreManager(syncQueue, supabase);

// Periodic flush
setInterval(() => syncQueue.triggerFlush(), 5000);

function rebuildLevelGrid() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  const unlocked = GameData.getUnlockedLevel();

  for (let i = 1; i <= 100; i++) {
    const cell = document.createElement('div');
    cell.className = 'level-cell';
    const bestTime = GameData.getBestTime(i);

    if (bestTime !== null) {
      cell.classList.add('completed');
    } else if (i <= unlocked) {
      cell.classList.add('unlocked');
    } else {
      cell.classList.add('locked');
    }

    const numSpan = document.createElement('span');
    numSpan.className = 'level-number';
    numSpan.textContent = i;
    cell.appendChild(numSpan);

    if (bestTime !== null) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'level-time';
      timeSpan.textContent = `${bestTime.toFixed(1)}s`;
      cell.appendChild(timeSpan);
    }

    if (i <= unlocked) {
      cell.addEventListener('click', () => startLevel(i));
    }

    // Leaderboard icon
    const lbIcon = document.createElement('span');
    lbIcon.className = 'leaderboard-icon';
    lbIcon.textContent = '🏆';
    lbIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      LeaderboardModal.open(i);
    });
    cell.appendChild(lbIcon);

    grid.appendChild(cell);
  }
}

function startLevel(level) {
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  game.scene.start('GameScene', { level });
}

function showMenu() {
  rebuildLevelGrid();
  document.getElementById('menu-screen').style.display = 'flex';
  document.getElementById('game-screen').style.display = 'none';
}

window.showMenu = showMenu;

// Override GameData.completeLevel to also sync
const originalComplete = GameData.completeLevel.bind(GameData);
GameData.completeLevel = function(level, time) {
  originalComplete(level, time);
  const player = AuthManager.loadPlayer();
  if (player) {
    scoreManager.submitScore(player.id, level, time);
  }
};

// Logout
document.getElementById('logout-button').addEventListener('click', () => {
  AuthManager.clearPlayer();
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('menu-screen').style.display = 'none';
  LoginScreen.init(supabase);
});

// Close leaderboard modal
document.getElementById('leaderboard-close').addEventListener('click', () => {
  LeaderboardModal.close();
});

// Close modal on click outside
document.getElementById('leaderboard-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) LeaderboardModal.close();
});

// Initialize: check if logged in
const existingPlayer = AuthManager.loadPlayer();
if (existingPlayer) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('menu-screen').style.display = 'flex';
  rebuildLevelGrid();
} else {
  LoginScreen.init(supabase);
}

window.afterLogin = () => {
  rebuildLevelGrid();
  SyncStatus.init(syncQueue);
};

SyncStatus.init(syncQueue);
```

- [ ] **Step 4: Run existing tests to ensure nothing broke**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add index.html style.css js/main.js
git commit -m "feat: wire up login, leaderboard, and sync in main"
```

---

### Task 11: Verify UI changes with Devtools

**Files:** N/A — manual verification

- [ ] **Step 1: Start dev server and open in browser**

Since there's no dev server, open the HTML file directly or serve with a one-liner:
Run: `npx serve .` or `python3 -m http.server 8080`

- [ ] **Step 2: Verify login flow**

Open the page. Confirm login screen shows with email + screen name + Enter button. Enter credentials, click Enter. Confirm level grid appears.

- [ ] **Step 3: Verify leaderboard**

Click a leaderboard icon on a level tile. Confirm modal opens showing top 10 (or "No scores yet"). Close by clicking Close button and by clicking outside.

- [ ] **Step 4: Verify sync status**

Confirm sync status dot appears in top-right. Green when idle, changes state when entries are queued.

---

### Task 12: Final test run and cleanup

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run Supabase advisors to check for issues**

Run `supabase_get_advisors` for security and performance. Fix any flagged issues.

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup after supabase integration"
```
