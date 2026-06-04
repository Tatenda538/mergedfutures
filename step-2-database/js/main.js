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

    const lbIcon = document.createElement('span');
    lbIcon.className = 'leaderboard-icon';
    lbIcon.textContent = '\u{1F3C6}';
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

const originalComplete = GameData.completeLevel.bind(GameData);
GameData.completeLevel = function(level, time) {
  const player = AuthManager.loadPlayer();
  if (player) {
    scoreManager.submitScore(player.id, level, time);
  }
  originalComplete(level, time);
};

document.getElementById('logout-button').addEventListener('click', () => {
  AuthManager.clearPlayer();
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('menu-screen').style.display = 'none';
  LoginScreen.init(supabase);
});

document.getElementById('leaderboard-close').addEventListener('click', () => {
  LeaderboardModal.close();
});

document.getElementById('leaderboard-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) LeaderboardModal.close();
});

const existingPlayer = AuthManager.loadPlayer();
if (existingPlayer) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('menu-screen').style.display = 'flex';
  rebuildLevelGrid();
  SyncStatus.init(syncQueue);
} else {
  LoginScreen.init(supabase);
}

window.afterLogin = () => {
  rebuildLevelGrid();
  SyncStatus.init(syncQueue);
};
