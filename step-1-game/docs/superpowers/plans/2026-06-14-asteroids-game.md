# Asteroids Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100-level Asteroids arcade clone with cyberpunk styling, timed scoring, and a level-select grid.

**Architecture:** Hybrid approach — HTML/CSS for the level-select menu screen, Phaser.js canvas for gameplay. Pure data modules (GameData, LevelData, RockLogic) extracted into testable ES modules. Phaser scenes handle rendering and game loop.

**Tech Stack:** Phaser.js (CDN), vanilla JS (ES modules), Vitest for unit tests, CSS for cyberpunk UI.

**Design Doc:** `docs/superpowers/specs/2026-06-14-asteroids-game-design.md`

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`
- Create: `index.html` (skeleton)
- Create: `js/.gitkeep`
- Create: `tests/.gitkeep`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "asteroids-game",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
  },
});
```

- [ ] **Step 3: Create minimal index.html skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asteroids</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="menu-screen"></div>
  <div id="game-screen" style="display:none;"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create empty dirs**

```bash
mkdir -p js scenes tests
```

- [ ] **Step 5: Install deps and verify**

```bash
npm install
```

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.js index.html js/ tests/
git commit -m "chore: project scaffold with Phaser + Vitest"
```

---

### Task 2: GameData Module (TDD)

**Files:**
- Create: `js/GameData.js`
- Create: `tests/GameData.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { GameData } from '../js/GameData.js';

describe('GameData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns unlocked level 1 by default', () => {
    expect(GameData.getUnlockedLevel()).toBe(1);
  });

  it('stores completed level time and unlocks next', () => {
    GameData.completeLevel(1, 45.2);
    expect(GameData.getUnlockedLevel()).toBe(2);
    expect(GameData.getBestTime(1)).toBe(45.2);
  });

  it('only updates best time if new time is lower', () => {
    GameData.completeLevel(1, 45.2);
    GameData.completeLevel(1, 60.0);
    expect(GameData.getBestTime(1)).toBe(45.2);
    GameData.completeLevel(1, 30.0);
    expect(GameData.getBestTime(1)).toBe(30.0);
  });

  it('returns null for uncompleted level best time', () => {
    expect(GameData.getBestTime(99)).toBeNull();
  });

  it('does not decrease unlocked level', () => {
    GameData.completeLevel(3, 10.0);
    expect(GameData.getUnlockedLevel()).toBe(4);
    GameData.completeLevel(1, 5.0);
    expect(GameData.getUnlockedLevel()).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/GameData.test.js
```

Expected: FAIL — module not found errors

- [ ] **Step 3: Write minimal GameData.js**

```js
const UNLOCKED_KEY = 'asteroids_unlocked';
const TIMES_KEY = 'asteroids_times';

function getItem(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const GameData = {
  getUnlockedLevel() {
    return getItem(UNLOCKED_KEY, 1);
  },

  completeLevel(level, time) {
    const current = this.getUnlockedLevel();
    if (level >= current) {
      setItem(UNLOCKED_KEY, level + 1);
    }

    const times = getItem(TIMES_KEY, {});
    if (times[level] === undefined || time < times[level]) {
      times[level] = time;
      setItem(TIMES_KEY, times);
    }
  },

  getBestTime(level) {
    const times = getItem(TIMES_KEY, {});
    return times[level] !== undefined ? times[level] : null;
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/GameData.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/GameData.js tests/GameData.test.js
git commit -m "feat: GameData module with localStorage persistence"
```

---

### Task 3: LevelData Module (TDD)

**Files:**
- Create: `js/LevelData.js`
- Create: `tests/LevelData.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import { LevelData } from '../js/LevelData.js';

describe('LevelData', () => {
  it('returns params for level 1', () => {
    const p = LevelData.getLevelParams(1);
    expect(p.rockCount).toBe(3);
    expect(p.minSpeed).toBe(60);
    expect(p.maxSpeed).toBe(100);
    expect(p.minRadius).toBe(40);
    expect(p.maxRadius).toBe(60);
    expect(p.size).toBe('large');
  });

  it('returns params for level 50', () => {
    const p = LevelData.getLevelParams(50);
    expect(p.rockCount).toBe(10);
    expect(p.minSpeed).toBe(160);
    expect(p.minRadius).toBe(25);
  });

  it('returns params for level 100', () => {
    const p = LevelData.getLevelParams(100);
    expect(p.rockCount).toBe(18);
    expect(p.minSpeed).toBe(260);
    expect(p.minRadius).toBe(10);
    expect(p.maxRadius).toBe(20);
  });

  it('clamps radius minimum to 10', () => {
    const p = LevelData.getLevelParams(999);
    expect(p.minRadius).toBe(10);
    expect(p.maxRadius).toBe(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/LevelData.test.js
```

Expected: FAIL

- [ ] **Step 3: Write minimal LevelData.js**

```js
export const LevelData = {
  getLevelParams(level) {
    const rockCount = Math.min(3 + Math.floor(level * 0.15), 18);
    const minSpeed = 60 + level * 2;
    const maxSpeed = minSpeed + 40;
    const minRadius = Math.max(40 - Math.floor(level * 0.3), 10);
    const maxRadius = Math.max(60 - Math.floor(level * 0.4), minRadius + 10);

    let size = 'small';
    if (maxRadius >= 40) size = 'large';
    else if (maxRadius >= 25) size = 'medium';

    return { rockCount, minSpeed, maxSpeed, minRadius, maxRadius, size };
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/LevelData.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/LevelData.js tests/LevelData.test.js
git commit -m "feat: LevelData module with difficulty formulas"
```

---

### Task 4: RockLogic Module (TDD)

**Files:**
- Create: `js/RockLogic.js`
- Create: `tests/RockLogic.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import { RockLogic } from '../js/RockLogic.js';

describe('RockLogic', () => {
  describe('splitRock', () => {
    it('splits a large rock into 2 medium rocks', () => {
      const parent = { radius: 50, size: 'large' };
      const children = RockLogic.splitRock(parent);
      expect(children).toHaveLength(2);
      children.forEach(c => {
        expect(c.size).toBe('medium');
        expect(c.radius).toBe(30);
      });
    });

    it('splits a medium rock into 2 small rocks', () => {
      const parent = { radius: 30, size: 'medium' };
      const children = RockLogic.splitRock(parent);
      expect(children).toHaveLength(2);
      children.forEach(c => {
        expect(c.size).toBe('small');
        expect(c.radius).toBe(12);
      });
    });

    it('returns empty array for small rock (destroyed)', () => {
      const parent = { radius: 12, size: 'small' };
      expect(RockLogic.splitRock(parent)).toEqual([]);
    });

    it('gives children random velocity offsets', () => {
      const parent = { radius: 50, size: 'large', vx: 100, vy: 50 };
      const children = RockLogic.splitRock(parent);
      expect(children).toHaveLength(2);
      children.forEach(c => {
        expect(typeof c.vx).toBe('number');
        expect(typeof c.vy).toBe('number');
      });
    });
  });

  describe('generateRocks', () => {
    it('generates the requested number of rocks', () => {
      const params = { rockCount: 5, minSpeed: 60, maxSpeed: 100, minRadius: 30, maxRadius: 50 };
      const rocks = RockLogic.generateRocks(params, 800, 600);
      expect(rocks).toHaveLength(5);
    });

    it('each rock has required properties', () => {
      const params = { rockCount: 1, minSpeed: 60, maxSpeed: 100, minRadius: 30, maxRadius: 50 };
      const rocks = RockLogic.generateRocks(params, 800, 600);
      const rock = rocks[0];
      expect(rock).toHaveProperty('x');
      expect(rock).toHaveProperty('y');
      expect(rock).toHaveProperty('vx');
      expect(rock).toHaveProperty('vy');
      expect(rock).toHaveProperty('radius');
      expect(rock).toHaveProperty('size');
      expect(rock.radius).toBeGreaterThanOrEqual(30);
      expect(rock.radius).toBeLessThanOrEqual(50);
    });

    it('keeps rocks away from the center spawn area', () => {
      const params = { rockCount: 20, minSpeed: 60, maxSpeed: 100, minRadius: 30, maxRadius: 50 };
      const rocks = RockLogic.generateRocks(params, 800, 600);
      rocks.forEach(r => {
        const dist = Math.hypot(r.x - 400, r.y - 300);
        expect(dist).toBeGreaterThan(150);
      });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/RockLogic.test.js
```

Expected: FAIL

- [ ] **Step 3: Write minimal RockLogic.js**

```js
const SPAWN_CLEARANCE = 150; // pixels from center to avoid placing rocks

export const RockLogic = {
  splitRock(rock) {
    if (rock.size === 'small') return [];

    const childSize = rock.size === 'large' ? 'medium' : 'small';
    const childRadius = rock.size === 'large'
      ? Math.round(rock.radius * 0.6)
      : Math.round(rock.radius * 0.4);

    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = angle1 + Math.PI;
    const speed = 40 + Math.random() * 30;

    return [
      { x: rock.x, y: rock.y, radius: childRadius, size: childSize, vx: rock.vx + Math.cos(angle1) * speed, vy: rock.vy + Math.sin(angle1) * speed },
      { x: rock.x, y: rock.y, radius: childRadius, size: childSize, vx: rock.vx + Math.cos(angle2) * speed, vy: rock.vy + Math.sin(angle2) * speed },
    ];
  },

  generateRocks(params, gameWidth, gameHeight) {
    const cx = gameWidth / 2;
    const cy = gameHeight / 2;
    const rocks = [];

    for (let i = 0; i < params.rockCount; i++) {
      let x, y;
      do {
        x = Math.random() * gameWidth;
        y = Math.random() * gameHeight;
      } while (Math.hypot(x - cx, y - cy) < SPAWN_CLEARANCE);

      const angle = Math.random() * Math.PI * 2;
      const speed = params.minSpeed + Math.random() * (params.maxSpeed - params.minSpeed);
      const radius = params.minRadius + Math.random() * (params.maxRadius - params.minRadius);

      let size = 'small';
      if (radius >= 40) size = 'large';
      else if (radius >= 25) size = 'medium';

      rocks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius, size });
    }

    return rocks;
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/RockLogic.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/RockLogic.js tests/RockLogic.test.js
git commit -m "feat: RockLogic module with generation and splitting"
```

---

### Task 5: HTML + CSS Structure

**Files:**
- Modify: `index.html`
- Create: `style.css`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asteroids</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="menu-screen">
    <h1 id="title">ASTEROIDS</h1>
    <div id="level-grid"></div>
  </div>
  <div id="game-screen" style="display:none;"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a1a;
  color: #00ffff;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#menu-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

#title {
  font-size: 3rem;
  text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff;
  margin-bottom: 2rem;
  letter-spacing: 0.3em;
}

#level-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  max-width: 600px;
  width: 90%;
}

.level-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #00ffff33;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  background: #0a0a1a;
  user-select: none;
}

.level-cell .level-number {
  font-size: 1rem;
  font-weight: bold;
}

.level-cell .level-time {
  font-size: 0.55rem;
  opacity: 0.7;
}

.level-cell.unlocked {
  border-color: #00ffff;
  box-shadow: 0 0 8px #00ffff66;
}

.level-cell.unlocked:hover {
  box-shadow: 0 0 16px #00ffff;
  background: #00ffff11;
}

.level-cell.locked {
  opacity: 0.3;
  cursor: not-allowed;
}

.level-cell.completed {
  border-color: #ff00ff;
  box-shadow: 0 0 8px #ff00ff66;
}

#game-screen {
  width: 100vw;
  height: 100vh;
}

#game-screen canvas {
  display: block;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css
git commit -m "feat: HTML structure and cyberpunk CSS"
```

---

### Task 6: GameScene Scene Directory

**Files:**
- Create: directory for scenes

- [ ] **Step 1: Create scenes dir (empty, GameScene created in next task)**

```bash
mkdir -p js/scenes
```

- [ ] **Step 2: Commit**

```bash
git add js/scenes/
git commit -m "chore: scenes directory"
```

---

### Task 7: GameScene - Starfield + Ship

**Files:**
- Create: `js/scenes/GameScene.js`

- [ ] **Step 1: Write the scene with starfield and ship rendering**

```js
import { RockLogic } from '../RockLogic.js';
import { LevelData } from '../LevelData.js';
import { GameData } from '../GameData.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data.level || 1;
    this.shipAngle = -Math.PI / 2;
    this.shipVx = 0;
    this.shipVy = 0;
    this.bullets = [];
    this.rocks = [];
    this.fireCooldown = 0;
    this.gameOver = false;
    this.levelComplete = false;
    this.elapsed = 0;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.drawStarfield();

    // Ship
    this.shipGraphics = this.add.graphics();

    // Rocks
    const params = LevelData.getLevelParams(this.levelNumber);
    const rockData = RockLogic.generateRocks(params, w, h);
    this.rocks = rockData.map(r => ({
      ...r,
      graphics: this.add.graphics(),
    }));
    this.rocks.forEach(r => this.drawRock(r));

    // Timer text
    this.timerText = this.add.text(w - 16, 16, '0.0', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#00ffff',
    }).setOrigin(1, 0);

    // Level text
    this.levelText = this.add.text(16, 16, `LEVEL ${this.levelNumber}`, {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#00ffff',
    });

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Game over overlay
    this.overlay = this.add.graphics();
    this.overlayText = this.add.text(w / 2, h / 2, '', {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#00ffff',
    }).setOrigin(0.5).setVisible(false);

    this.overlaySubText = this.add.text(w / 2, h / 2 + 40, 'Click to continue', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#00ffff',
    }).setOrigin(0.5).setVisible(false);
  }

  drawStarfield() {
    const w = this.scale.width;
    const h = this.scale.height;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 100; i++) {
      g.fillCircle(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.5);
    }
  }

  drawShip() {
    const g = this.shipGraphics;
    g.clear();
    g.lineStyle(2, 0x00ffff, 1);
    const len = 18;
    const tip = {
      x: Math.cos(this.shipAngle) * len,
      y: Math.sin(this.shipAngle) * len,
    };
    const left = {
      x: Math.cos(this.shipAngle + 2.3) * len * 0.8,
      y: Math.sin(this.shipAngle + 2.3) * len * 0.8,
    };
    const right = {
      x: Math.cos(this.shipAngle - 2.3) * len * 0.8,
      y: Math.sin(this.shipAngle - 2.3) * len * 0.8,
    };
    g.beginPath();
    g.moveTo(this.shipX + tip.x, this.shipY + tip.y);
    g.lineTo(this.shipX + left.x, this.shipY + left.y);
    g.lineTo(this.shipX + right.x, this.shipY + right.y);
    g.closePath();
    g.strokePath();
  }

  drawRock(rock) {
    const g = rock.graphics;
    g.clear();
    g.lineStyle(2, 0xff00ff, 1);
    const sides = 8 + Math.floor(Math.random() * 4);
    g.beginPath();
    const points = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = rock.radius * (0.7 + Math.random() * 0.3);
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    g.moveTo(rock.x + points[0].x, rock.y + points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(rock.x + points[i].x, rock.y + points[i].y);
    }
    g.closePath();
    g.strokePath();
  }
}
```

- [ ] **Step 2: Add the update method to GameScene**

Add after `drawRock`:

```js
  update(time, delta) {
    if (this.gameOver || this.levelComplete) return;

    const w = this.scale.width;
    const h = this.scale.height;
    const dt = delta / 1000;

    // Timer
    this.elapsed += dt;
    this.timerText.setText(this.elapsed.toFixed(1));

    // Ship rotation
    if (this.cursors.left.isDown) this.shipAngle -= 3 * dt;
    if (this.cursors.right.isDown) this.shipAngle += 3 * dt;

    // Thrust
    if (this.cursors.up.isDown) {
      this.shipVx += Math.cos(this.shipAngle) * 200 * dt;
      this.shipVy += Math.sin(this.shipAngle) * 200 * dt;
    }

    // Friction (space drift)
    this.shipVx *= 0.99;
    this.shipVy *= 0.99;

    // Move ship
    this.shipX = (this.shipX + this.shipVx * dt + w) % w;
    this.shipY = (this.shipY + this.shipVy * dt + h) % h;
    this.drawShip();

    // Fire
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    if (this.spaceKey.isDown && this.fireCooldown === 0) {
      this.fireBullet();
      this.fireCooldown = 0.25;
    }
  }
```

Full context needed, let me write the complete file:

- [ ] **Step 3: Write complete GameScene.js**

Replace the partial with the complete file:

```js
import { RockLogic } from '../RockLogic.js';
import { LevelData } from '../LevelData.js';
import { GameData } from '../GameData.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data.level || 1;
    this.shipX = 400;
    this.shipY = 300;
    this.shipAngle = -Math.PI / 2;
    this.shipVx = 0;
    this.shipVy = 0;
    this.bullets = [];
    this.rocks = [];
    this.fireCooldown = 0;
    this.gameOver = false;
    this.levelComplete = false;
    this.elapsed = 0;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.drawStarfield();

    this.shipGraphics = this.add.graphics();

    const params = LevelData.getLevelParams(this.levelNumber);
    const rockData = RockLogic.generateRocks(params, w, h);
    this.rocks = rockData.map(r => ({
      ...r,
      graphics: this.add.graphics(),
    }));
    this.rocks.forEach(r => this.drawRock(r));

    this.timerText = this.add.text(w - 16, 16, '0.0', {
      fontFamily: 'Courier New', fontSize: '24px', color: '#00ffff',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(16, 16, `LEVEL ${this.levelNumber}`, {
      fontFamily: 'Courier New', fontSize: '18px', color: '#00ffff',
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.overlay = this.add.graphics();
    this.overlayText = this.add.text(w / 2, h / 2, '', {
      fontFamily: 'Courier New', fontSize: '36px', color: '#00ffff',
    }).setOrigin(0.5).setVisible(false);

    this.overlaySubText = this.add.text(w / 2, h / 2 + 40, 'Click to continue', {
      fontFamily: 'Courier New', fontSize: '16px', color: '#00ffff',
    }).setOrigin(0.5).setVisible(false);

    this.input.on('pointerdown', () => {
      if (this.gameOver || this.levelComplete) {
        this.scene.stop('GameScene');
        document.getElementById('menu-screen').style.display = 'flex';
        document.getElementById('game-screen').style.display = 'none';
      }
    });
  }

  drawStarfield() {
    const w = this.scale.width;
    const h = this.scale.height;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 100; i++) {
      g.fillCircle(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.5);
    }
  }

  drawShip() {
    const g = this.shipGraphics;
    g.clear();
    g.lineStyle(2, 0x00ffff, 1);
    const len = 18;
    const tip = { x: Math.cos(this.shipAngle) * len, y: Math.sin(this.shipAngle) * len };
    const left = { x: Math.cos(this.shipAngle + 2.3) * len * 0.8, y: Math.sin(this.shipAngle + 2.3) * len * 0.8 };
    const right = { x: Math.cos(this.shipAngle - 2.3) * len * 0.8, y: Math.sin(this.shipAngle - 2.3) * len * 0.8 };
    g.beginPath();
    g.moveTo(this.shipX + tip.x, this.shipY + tip.y);
    g.lineTo(this.shipX + left.x, this.shipY + left.y);
    g.lineTo(this.shipX + right.x, this.shipY + right.y);
    g.closePath();
    g.strokePath();
  }

  drawRock(rock) {
    const g = rock.graphics;
    g.clear();
    g.lineStyle(2, 0xff00ff, 1);
    const sides = 8 + Math.floor(Math.random() * 4);
    const points = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = rock.radius * (0.7 + Math.random() * 0.3);
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    g.beginPath();
    g.moveTo(rock.x + points[0].x, rock.y + points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(rock.x + points[i].x, rock.y + points[i].y);
    }
    g.closePath();
    g.strokePath();
  }

  update(time, delta) {
    if (this.gameOver || this.levelComplete) return;

    const w = this.scale.width;
    const h = this.scale.height;
    const dt = delta / 1000;

    this.elapsed += dt;
    this.timerText.setText(this.elapsed.toFixed(1));

    if (this.cursors.left.isDown) this.shipAngle -= 3 * dt;
    if (this.cursors.right.isDown) this.shipAngle += 3 * dt;
    if (this.cursors.up.isDown) {
      this.shipVx += Math.cos(this.shipAngle) * 200 * dt;
      this.shipVy += Math.sin(this.shipAngle) * 200 * dt;
    }
    this.shipVx *= 0.99;
    this.shipVy *= 0.99;

    this.shipX = (this.shipX + this.shipVx * dt + w) % w;
    this.shipY = (this.shipY + this.shipVy * dt + h) % h;
    this.drawShip();

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    if (this.spaceKey.isDown && this.fireCooldown === 0) {
      this.fireBullet();
      this.fireCooldown = 0.25;
    }

    this.updateBullets(dt, w, h);
    this.updateRocks(dt, w, h);
    this.checkCollisions();
    this.checkWinCondition();
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add js/scenes/GameScene.js
git commit -m "feat: GameScene with ship, starfield, and movement"
```

---

### Task 8: GameScene - Bullets + Rocks Update + Collisions

**Files:**
- Modify: `js/scenes/GameScene.js` (add methods)

Add these methods to GameScene class:

- [ ] **Step 1: Add bullet and rock update methods**

Insert after `drawRock`:

```js
  fireBullet() {
    const speed = 400;
    this.bullets.push({
      x: this.shipX,
      y: this.shipY,
      vx: Math.cos(this.shipAngle) * speed,
      vy: Math.sin(this.shipAngle) * speed,
      life: 1.5,
      graphics: this.add.graphics(),
    });
    const b = this.bullets[this.bullets.length - 1];
    b.graphics.lineStyle(2, 0x00ffff, 1);
    b.graphics.beginPath();
    b.graphics.arc(0, 0, 2, 0, Math.PI * 2);
    b.graphics.strokePath();
  }

  updateBullets(dt, w, h) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) {
        b.graphics.destroy();
        this.bullets.splice(i, 1);
      } else {
        b.graphics.setPosition(b.x, b.y);
      }
    }
  }

  updateRocks(dt, w, h) {
    for (const rock of this.rocks) {
      rock.x = (rock.x + rock.vx * dt + w) % w;
      rock.y = (rock.y + rock.vy * dt + h) % h;
      rock.graphics.setPosition(0, 0);
      this.drawRock(rock);
    }
  }

  checkCollisions() {
    // Bullet vs rock
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      for (let ri = this.rocks.length - 1; ri >= 0; ri--) {
        const rock = this.rocks[ri];
        const dist = Math.hypot(b.x - rock.x, b.y - rock.y);
        if (dist < rock.radius) {
          b.graphics.destroy();
          this.bullets.splice(bi, 1);
          this.explodeRock(ri);
          break;
        }
      }
    }

    // Ship vs rock
    for (const rock of this.rocks) {
      const dist = Math.hypot(this.shipX - rock.x, this.shipY - rock.y);
      if (dist < rock.radius + 8) {
        this.endGame();
        return;
      }
    }
  }

  explodeRock(index) {
    const rock = this.rocks[index];
    rock.graphics.destroy();
    const children = RockLogic.splitRock(rock);
    this.rocks.splice(index, 1);
    for (const child of children) {
      child.graphics = this.add.graphics();
      this.drawRock(child);
      this.rocks.push(child);
    }
  }

  endGame() {
    this.gameOver = true;
    this.showOverlay('GAME OVER', '#ff00ff');
  }

  checkWinCondition() {
    if (this.rocks.length === 0 && !this.gameOver && !this.levelComplete) {
      this.levelComplete = true;
      GameData.completeLevel(this.levelNumber, this.elapsed);
      const best = GameData.getBestTime(this.levelNumber);
      this.showOverlay(`LEVEL COMPLETE\n${this.elapsed.toFixed(1)}s (best: ${best.toFixed(1)}s)`, '#00ffff');
    }
  }

  showOverlay(text, color) {
    const w = this.scale.width;
    const h = this.scale.height;
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.6);
    this.overlay.fillRect(0, 0, w, h);
    this.overlayText.setText(text);
    this.overlayText.setColor(color);
    this.overlayText.setVisible(true);
    this.overlaySubText.setVisible(true);
  }
```

- [ ] **Step 2: Commit**

```bash
git add js/scenes/GameScene.js
git commit -m "feat: bullets, rock splitting, collisions, game state"
```

---

### Task 9: main.js - Phaser Config + Screen Switching

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Write main.js**

```js
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

function buildLevelGrid() {
  const grid = document.getElementById('level-grid');
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

buildLevelGrid();
```

- [ ] **Step 2: Commit**

```bash
git add js/main.js
git commit -m "feat: main.js with Phaser config and level grid wiring"
```

---

### Task 10: Verify with DevTools + Polish

**Files:** (visual verification)

- [ ] **Step 1: Serve the game locally**

```bash
npx serve .
```

Open in browser and verify:
- Level grid renders with Level 1 unlocked, others locked
- Clicking Level 1 starts the game
- Ship renders, rotates, thrusts
- Rocks render and move
- Space fires bullets
- Bullets destroy rocks, rocks split
- Ship collision shows Game Over
- Clearing all rocks shows Level Complete
- Completion saves time and unlocks next level
- Returning to menu shows updated grid

- [ ] **Step 2: Fix any issues found**

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: PASS (all tests)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: final polish and bug fixes"
```
