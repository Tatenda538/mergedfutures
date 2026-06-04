import { GameScene } from './scenes/GameScene.js';
import { GameData } from './GameData.js';

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
rebuildLevelGrid();
