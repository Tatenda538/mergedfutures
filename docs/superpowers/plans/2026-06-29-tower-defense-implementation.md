# Tower Defense Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable tower defense game with procedural maps, 6 tower types, and persistent progression.

**Architecture:** Canvas-rendered game loop with DOM-based UI screens. All game logic in pure JS modules; rendering and UI are separate concerns. Tests run via a lightweight in-browser test harness.

**Tech Stack:** Plain HTML/CSS/JS, Canvas 2D API, localStorage.

## Global Constraints

- All files go in `step-0-setup/` directory
- No external dependencies or libraries
- TDD: every pure-logic module gets a test file
- Test results must display in-browser (open `tests/runner.html`)
- UI/UX verified via chrome-devtools MCP before declaring complete
- Frequent commits per task

---

### Task 1: Project Scaffold & Test Harness

**Files:**
- Create: `step-0-setup/index.html`
- Create: `step-0-setup/css/style.css`
- Create: `step-0-setup/tests/runner.html`
- Create: `step-0-setup/tests/tdd.js`

**Interfaces:**
- Consumes: nothing
- Produces: `window.TDD` — test framework globals (`assert`, `assertEqual`, `assertNotEqual`, `results`)
- Produces: Screen container IDs — `screen-title`, `screen-mode-select`, `screen-loadout`, `screen-game`, `screen-end`, `screen-shop`, `screen-tutorial`

- [ ] **Step 1: Create `tests/tdd.js`**

```js
window.TDD = (function() {
  const results = { passed: 0, failed: 0, errors: [] };

  function assert(condition, message) {
    if (condition) { results.passed++; }
    else { results.failed++; results.errors.push('FAIL: ' + message); }
  }

  function assertEqual(actual, expected, message) {
    if (actual === expected) { results.passed++; }
    else { results.failed++; results.errors.push('FAIL: ' + message + ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)); }
  }

  function assertNotEqual(actual, expected, message) {
    if (actual !== expected) { results.passed++; }
    else { results.failed++; results.errors.push('FAIL: ' + message + ' — both are ' + JSON.stringify(actual)); }
  }

  function assertThrows(fn, message) {
    try { fn(); results.failed++; results.errors.push('FAIL: ' + message + ' — no error thrown'); }
    catch (e) { results.passed++; }
  }

  function report() {
    const el = document.getElementById('test-results');
    if (!el) return;
    el.innerHTML = '<h2>Test Results</h2>' +
      '<p>Passed: ' + results.passed + ' | Failed: ' + results.failed + '</p>' +
      (results.errors.length ? '<ul>' + results.errors.map(function(e) { return '<li>' + e + '</li>'; }).join('') + '</ul>' : '<p>All tests passed!</p>');
    return results;
  }

  function reset() { results.passed = 0; results.failed = 0; results.errors = []; }

  return { assert: assert, assertEqual: assertEqual, assertNotEqual: assertNotEqual, assertThrows: assertThrows, report: report, reset: reset };
})();
```

- [ ] **Step 2: Create `tests/runner.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>TD Test Runner</title></head>
<body>
  <div id="test-results">Running tests...</div>
  <script src="../js/state.js"></script>
  <script src="../js/entities.js"></script>
  <script src="../js/waves.js"></script>
  <script src="../js/mapgen.js"></script>
  <script src="tdd.js"></script>
  <script src="state.test.js"></script>
  <script src="entities.test.js"></script>
  <script src="waves.test.js"></script>
  <script src="mapgen.test.js"></script>
  <script>window.TDD.report();</script>
</body>
</html>
```

Note: test files will be created in later tasks; they'll start empty so the runner can exist now.

- [ ] **Step 3: Create `index.html` — screens as sections**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tower Defense</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Title Screen -->
  <div id="screen-title" class="screen active">
    <h1>TOWER DEFENSE</h1>
    <button id="btn-play">Play</button>
    <button id="btn-shop">Shop</button>
    <button id="btn-tutorial">Tutorial</button>
  </div>

  <!-- Tutorial Overlay -->
  <div id="screen-tutorial" class="screen overlay">
    <div class="modal"><pre>Tutorial text here</pre><button id="btn-tutorial-close">Close</button></div>
  </div>

  <!-- Shop Screen -->
  <div id="screen-shop" class="screen">
    <h2>Shop</h2>
    <div id="shop-coins">Coins: 0</div>
    <div id="shop-tower-list"></div>
    <button id="btn-shop-back">Back</button>
  </div>

  <!-- Mode Select Screen -->
  <div id="screen-mode-select" class="screen">
    <h2>Select Mode</h2>
    <div id="map-type-select"></div>
    <div id="difficulty-select"></div>
    <button id="btn-mode-confirm">Next: Loadout</button>
    <button id="btn-mode-back">Back</button>
  </div>

  <!-- Loadout Screen -->
  <div id="screen-loadout" class="screen">
    <h2>Choose Your Loadout</h2>
    <div id="available-towers"></div>
    <div id="loadout-slots"></div>
    <button id="btn-loadout-start">Start Game</button>
    <button id="btn-loadout-back">Back</button>
  </div>

  <!-- Game Screen -->
  <div id="screen-game" class="screen">
    <div id="game-hud"><span id="hud-wave">Wave 0/0</span> | <span id="hud-gold">Gold: 0</span> | <span id="hud-lives">Lives: 20</span></div>
    <canvas id="game-canvas"></canvas>
    <div id="game-loadout-bar"></div>
    <button id="btn-start-wave">Start Wave</button>
    <button id="btn-game-quit">Quit</button>
  </div>

  <!-- End Screen -->
  <div id="screen-end" class="screen">
    <h2 id="end-title">You Win!</h2>
    <button id="btn-end-retry">Retry</button>
    <button id="btn-end-menu">Main Menu</button>
  </div>

  <script src="js/state.js"></script>
  <script src="js/entities.js"></script>
  <script src="js/waves.js"></script>
  <script src="js/mapgen.js"></script>
  <script src="js/game.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create `css/style.css` — base styles**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #111; color: #eee; overflow: hidden; height: 100vh; }
.screen { display: none; width: 100%; height: 100vh; position: absolute; top: 0; left: 0; }
.screen.active { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.screen.overlay { background: rgba(0,0,0,0.8); z-index: 10; }
.modal { background: #222; padding: 2em; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto; }
button { padding: 10px 24px; margin: 6px; font-size: 16px; cursor: pointer; border: 1px solid #555; background: #333; color: #eee; border-radius: 4px; }
button:hover { background: #444; }
h1 { font-size: 48px; margin-bottom: 24px; }
h2 { font-size: 32px; margin-bottom: 16px; }
#game-canvas { background: #1a1a2e; display: block; }
```

- [ ] **Step 5: Verify and commit**

```
Open tests/runner.html in browser — should show "Test Results Passed: 0 | Failed: 0"
Open index.html in browser — should show title screen with buttons
```

```bash
git add step-0-setup/index.html step-0-setup/css/style.css step-0-setup/tests/runner.html step-0-setup/tests/tdd.js
git commit -m "feat: project scaffold and test harness"
```

---

### Task 2: State & Persistence Module

**Files:**
- Create: `step-0-setup/js/state.js`
- Create: `step-0-setup/tests/state.test.js`

**Interfaces:**
- Consumes: nothing (standalone pure module)
- Produces: `window.GameState` module with:
  - `getState()` → full state object
  - `reset()` → clears all data
  - `addCoins(n)` → adds coins
  - `spendCoins(n)` → `boolean` (false if insufficient)
  - `getCoins()` → `number`
  - `unlockTower(towerId)` → `void`
  - `isTowerUnlocked(towerId)` → `boolean`
  - `getUnlockedTowers()` → `string[]`
  - `recordWin(mapType, difficulty)` → `void`
  - `hasWon(mapType, difficulty)` → `boolean`
  - `save()` → persists to localStorage
  - `load()` → loads from localStorage

- [ ] **Step 1: Write the failing test — `tests/state.test.js`**

```js
(function() {
  window.GameState.reset();

  TDD.assertEqual(window.GameState.getCoins(), 0, 'starts with 0 coins');
  TDD.assertEqual(window.GameState.getUnlockedTowers().length, 1, 'starts with 1 tower unlocked');

  window.GameState.addCoins(100);
  TDD.assertEqual(window.GameState.getCoins(), 100, 'addCoins adds');

  TDD.assertEqual(window.GameState.spendCoins(30), true, 'spendCoins returns true');
  TDD.assertEqual(window.GameState.getCoins(), 70, 'coins deducted');

  TDD.assertEqual(window.GameState.spendCoins(200), false, 'spendCoins returns false when insufficient');
  TDD.assertEqual(window.GameState.getCoins(), 70, 'coins unchanged after failed spend');

  window.GameState.unlockTower('cannon');
  TDD.assertEqual(window.GameState.isTowerUnlocked('cannon'), true, 'tower unlocked');
  TDD.assertEqual(window.GameState.isTowerUnlocked('nonexistent'), false, 'unknown tower not unlocked');

  window.GameState.recordWin('field', 'easy');
  TDD.assertEqual(window.GameState.hasWon('field', 'easy'), true, 'win recorded');
  TDD.assertEqual(window.GameState.hasWon('field', 'hard'), false, 'unplayed diff not won');

  window.GameState.save();
  window.GameState.reset();
  TDD.assertEqual(window.GameState.getCoins(), 0, 'reset clears coins');
  window.GameState.load();
  TDD.assertEqual(window.GameState.getCoins(), 70, 'load restores coins');
})();
```

- [ ] **Step 2: Run runner.html to verify test fails**

Open `tests/runner.html` — expected: errors about `GameState` not defined.

- [ ] **Step 3: Create `js/state.js`**

```js
window.GameState = (function() {
  var state = {
    coins: 0,
    unlockedTowers: ['arrow'],
    wins: {}
  };

  function getState() { return state; }

  function reset() {
    state.coins = 0;
    state.unlockedTowers = ['arrow'];
    state.wins = {};
  }

  function addCoins(n) { state.coins += n; }

  function spendCoins(n) {
    if (state.coins < n) return false;
    state.coins -= n;
    return true;
  }

  function getCoins() { return state.coins; }

  function unlockTower(id) {
    if (state.unlockedTowers.indexOf(id) === -1) state.unlockedTowers.push(id);
  }

  function isTowerUnlocked(id) { return state.unlockedTowers.indexOf(id) !== -1; }

  function getUnlockedTowers() { return state.unlockedTowers.slice(); }

  function recordWin(mapType, difficulty) {
    state.wins[mapType + '-' + difficulty] = true;
  }

  function hasWon(mapType, difficulty) {
    return !!state.wins[mapType + '-' + difficulty];
  }

  function save() {
    localStorage.setItem('td_state', JSON.stringify(state));
  }

  function load() {
    var saved = localStorage.getItem('td_state');
    if (saved) {
      try {
        var parsed = JSON.parse(saved);
        state.coins = parsed.coins || 0;
        state.unlockedTowers = parsed.unlockedTowers || ['arrow'];
        state.wins = parsed.wins || {};
      } catch(e) { reset(); }
    }
  }

  return {
    getState: getState,
    reset: reset,
    addCoins: addCoins,
    spendCoins: spendCoins,
    getCoins: getCoins,
    unlockTower: unlockTower,
    isTowerUnlocked: isTowerUnlocked,
    getUnlockedTowers: getUnlockedTowers,
    recordWin: recordWin,
    hasWon: hasWon,
    save: save,
    load: load
  };
})();
```

- [ ] **Step 4: Run runner.html to verify tests pass**

Expected: all state tests pass.

- [ ] **Step 5: Commit**

```bash
git add step-0-setup/js/state.js step-0-setup/tests/state.test.js
git commit -m "feat: state and persistence module"
```

---

### Task 3: Entity Classes

**Files:**
- Create: `step-0-setup/js/entities.js`
- Create: `step-0-setup/tests/entities.test.js`

**Interfaces:**
- Consumes: nothing (standalone pure module)
- Produces: `window.Entities` module with:
  - `TOWER_TYPES` — object with type definitions:
    - `{ arrow: { name, cost, range, damage, fireRate, special, upgradeCosts, upgradeDamage, upgradeRange, upgradeFireRate } }`
  - `ENEMY_TYPES` — object: `{ normal, fast, tank, boss }` with `{ hp, speed, goldValue }`
  - `createTower(type, x, y)` → `{ type, x, y, level, range, damage, fireRate, cooldown, canFire(t), fire(t), upgrade(), getStats() }`
  - `createEnemy(type, waypoints)` → `{ type, hp, maxHp, speed, x, y, goldValue, pathIndex, alive, takeDamage(n), move(dt), reachedEnd() }`
  - `getTowerUpgradeCost(tower)` → `number`
  - `distance(x1, y1, x2, y2)` → `number`
  - `TOWER_IDS` — `['arrow','cannon','ice','sniper','tesla','mortar']`

- [ ] **Step 1: Write the failing test — `tests/entities.test.js`**

```js
(function() {
  var E = window.Entities;

  TDD.assertEqual(typeof E.createTower, 'function', 'createTower exists');
  TDD.assertEqual(typeof E.createEnemy, 'function', 'createEnemy exists');

  var tower = E.createTower('arrow', 3, 5);
  TDD.assertEqual(tower.type, 'arrow', 'tower type set');
  TDD.assertEqual(tower.x, 3, 'tower x set');
  TDD.assertEqual(tower.y, 5, 'tower y set');
  TDD.assertEqual(tower.level, 1, 'tower starts at level 1');
  TDD.assert(tower.range > 0, 'tower has range');
  TDD.assert(tower.damage > 0, 'tower has damage');

  TDD.assertEqual(tower.canFire(0), true, 'tower can fire initially');
  tower.fire(0);
  TDD.assertEqual(tower.canFire(0), false, 'tower cannot fire immediately after firing');
  TDD.assertEqual(tower.canFire(9999), true, 'tower can fire after cooldown');

  var waypoints = [{x:0,y:0}, {x:5,y:0}, {x:5,y:10}];
  var enemy = E.createEnemy('normal', waypoints);
  TDD.assertEqual(enemy.type, 'normal', 'enemy type set');
  TDD.assert(enemy.hp > 0, 'enemy has hp');
  TDD.assert(enemy.speed > 0, 'enemy has speed');
  TDD.assertEqual(enemy.pathIndex, 0, 'enemy starts at first waypoint');
  TDD.assertEqual(enemy.alive, true, 'enemy starts alive');
  TDD.assertEqual(enemy.reachedEnd(), false, 'enemy has not reached end');

  enemy.move(0, waypoints);
  TDD.assertEqual(enemy.pathIndex, 0, 'enemy does not move with 0 dt');

  enemy.takeDamage(9999);
  TDD.assertEqual(enemy.alive, false, 'enemy dies from fatal damage');

  var enemy2 = E.createEnemy('normal', waypoints);
  enemy2.takeDamage(5);
  TDD.assertEqual(enemy2.alive, true, 'enemy survives small damage');

  TDD.assert(E.distance(0, 0, 3, 4) === 5, 'distance calculation correct');

  TDD.assert(Array.isArray(E.TOWER_IDS), 'TOWER_IDS is array');
  TDD.assert(E.TOWER_IDS.length >= 5, 'at least 5 tower types');
})();
```

- [ ] **Step 2: Run runner.html to verify test fails**

Expected: errors about `Entities` not defined.

- [ ] **Step 3: Create `js/entities.js`**

```js
window.Entities = (function() {
  var TOWER_TYPES = {
    arrow:  { name:'Arrow',  cost:50,  range:150, damage:15, fireRate:500,  special:'none',    upgradeCosts:[75,125], upgradeDamage:[25,40],  upgradeRange:[180,220], upgradeFireRate:[400,300] },
    cannon: { name:'Cannon', cost:100, range:120, damage:40, fireRate:1500, special:'splash',  upgradeCosts:[150,250], upgradeDamage:[60,90],  upgradeRange:[140,160], upgradeFireRate:[1300,1000] },
    ice:    { name:'Ice',    cost:80,  range:130, damage:8,  fireRate:800,  special:'slow',   upgradeCosts:[120,200], upgradeDamage:[12,18], upgradeRange:[150,180], upgradeFireRate:[700,600] },
    sniper: { name:'Sniper', cost:150, range:300, damage:80, fireRate:2500, special:'none',    upgradeCosts:[200,350], upgradeDamage:[120,180],upgradeRange:[350,400], upgradeFireRate:[2200,2000] },
    tesla:  { name:'Tesla',  cost:120, range:100, damage:20, fireRate:700,  special:'chain',  upgradeCosts:[180,300], upgradeDamage:[30,45], upgradeRange:[120,140], upgradeFireRate:[600,500] },
    mortar: { name:'Mortar', cost:90,  range:250, damage:35, fireRate:2000, special:'aoe',    upgradeCosts:[140,220], upgradeDamage:[50,75], upgradeRange:[280,320], upgradeFireRate:[1800,1500] }
  };

  var ENEMY_TYPES = {
    normal: { hp:50,  speed:60,  goldValue:5 },
    fast:   { hp:30,  speed:120, goldValue:8 },
    tank:   { hp:150, speed:40,  goldValue:15 },
    boss:   { hp:500, speed:30,  goldValue:50 }
  };

  var TOWER_IDS = ['arrow','cannon','ice','sniper','tesla','mortar'];

  function distance(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function createTower(type, x, y) {
    var def = TOWER_TYPES[type];
    if (!def) return null;
    var t = {
      type: type,
      x: x,
      y: y,
      level: 1,
      range: def.range,
      damage: def.damage,
      fireRate: def.fireRate,
      cooldown: 0,
      special: def.special,
      canFire: function(time) { return time >= this.cooldown; },
      fire: function(time) { this.cooldown = time + this.fireRate; },
      upgrade: function() {
        if (this.level >= 3) return false;
        var idx = this.level - 1;
        this.level++;
        this.damage = def['upgradeDamage'][idx];
        this.range = def['upgradeRange'][idx];
        this.fireRate = def['upgradeFireRate'][idx];
        return true;
      },
      getUpgradeCost: function() {
        if (this.level >= 3) return -1;
        return def.upgradeCosts[this.level - 1];
      },
      getStats: function() {
        var def = TOWER_TYPES[this.type];
        return { type: this.type, name: def.name, level: this.level, range: this.range, damage: this.damage, fireRate: this.fireRate, special: def.special };
      }
    };
    return t;
  }

  function createEnemy(type, waypoints) {
    var def = ENEMY_TYPES[type] || ENEMY_TYPES.normal;
    if (!waypoints || waypoints.length < 2) return null;
    return {
      type: type,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed,
      x: waypoints[0].x,
      y: waypoints[0].y,
      goldValue: def.goldValue,
      pathIndex: 0,
      alive: true,
      waypoints: waypoints,
      takeDamage: function(amount) {
        this.hp -= amount;
        if (this.hp <= 0) { this.alive = false; this.hp = 0; }
        return !this.alive;
      },
      move: function(dt) {
        if (!this.alive) return;
        var wp = this.waypoints;
        if (this.pathIndex >= wp.length - 1) return;
        var target = wp[this.pathIndex + 1];
        var dx = target.x - this.x, dy = target.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) { this.pathIndex++; return; }
        var step = this.speed * dt;
        if (step >= dist) {
          this.x = target.x;
          this.y = target.y;
          this.pathIndex++;
        } else {
          this.x += (dx / dist) * step;
          this.y += (dy / dist) * step;
        }
      },
      reachedEnd: function() { return this.pathIndex >= this.waypoints.length - 1; }
    };
  }

  return {
    TOWER_TYPES: TOWER_TYPES,
    ENEMY_TYPES: ENEMY_TYPES,
    TOWER_IDS: TOWER_IDS,
    createTower: createTower,
    createEnemy: createEnemy,
    distance: distance
  };
})();
```

- [ ] **Step 4: Run runner.html to verify tests pass**

Expected: all entity tests pass.

- [ ] **Step 5: Commit**

```bash
git add step-0-setup/js/entities.js step-0-setup/tests/entities.test.js
git commit -m "feat: entity classes (towers, enemies)"
```

---

### Task 4: Wave System

**Files:**
- Create: `step-0-setup/js/waves.js`
- Create: `step-0-setup/tests/waves.test.js`

**Interfaces:**
- Consumes: `window.Entities.ENEMY_TYPES`, `window.Entities.createEnemy`
- Produces: `window.WaveManager` module with:
  - `configure(difficulty)` — sets wave params: totalWaves (25/32/40), hpMult, speedMult, countMult
  - `getTotalWaves()` → `number`
  - `getWaveEnemies(waveNum)` → `array` of `{ type, spawnDelay }` objects (configs for one wave)
  - `getWaveGoldBonus(waveNum)` → `number` (gold awarded for completing a wave)
  - `getDifficultyConfig()` → current difficulty settings

- [ ] **Step 1: Write the failing test — `tests/waves.test.js`**

```js
(function() {
  var W = window.WaveManager;

  TDD.assertEqual(typeof W.configure, 'function', 'configure exists');
  W.configure('easy');
  TDD.assertEqual(W.getTotalWaves(), 25, 'easy = 25 waves');
  W.configure('medium');
  TDD.assertEqual(W.getTotalWaves(), 32, 'medium = 32 waves');
  W.configure('hard');
  TDD.assertEqual(W.getTotalWaves(), 40, 'hard = 40 waves');

  W.configure('easy');
  var wave1 = W.getWaveEnemies(1);
  TDD.assert(Array.isArray(wave1), 'wave 1 returns array');
  TDD.assert(wave1.length >= 3, 'wave 1 has at least 3 enemies');

  var allNormal = wave1.every(function(e) { return e.type === 'normal'; });
  TDD.assert(allNormal, 'wave 1 is all normal enemies');

  W.configure('hard');
  var lateWave = W.getWaveEnemies(35);
  var hasBoss = lateWave.some(function(e) { return e.type === 'boss'; });
  TDD.assert(hasBoss, 'late hard wave includes boss');

  var bonus = W.getWaveGoldBonus(1);
  TDD.assert(bonus > 0, 'wave gold bonus is positive');
})();
```

- [ ] **Step 2: Run runner.html to verify test fails**

Expected: errors about `WaveManager` not defined.

- [ ] **Step 3: Create `js/waves.js`**

```js
window.WaveManager = (function() {
  var config = {
    totalWaves: 25,
    hpMult: 1,
    speedMult: 1,
    countMult: 1
  };

  var DIFFICULTY = {
    easy:   { totalWaves: 25, hpMult: 0.8, speedMult: 0.8, countMult: 0.7 },
    medium: { totalWaves: 32, hpMult: 1.0, speedMult: 1.0, countMult: 1.0 },
    hard:   { totalWaves: 40, hpMult: 1.3, speedMult: 1.2, countMult: 1.4 }
  };

  function configure(difficulty) {
    var d = DIFFICULTY[difficulty] || DIFFICULTY.easy;
    config.totalWaves = d.totalWaves;
    config.hpMult = d.hpMult;
    config.speedMult = d.speedMult;
    config.countMult = d.countMult;
  }

  function getTotalWaves() { return config.totalWaves; }

  function getDifficultyConfig() { return { totalWaves: config.totalWaves, hpMult: config.hpMult, speedMult: config.speedMult, countMult: config.countMult }; }

  function getWaveEnemies(waveNum) {
    var enemies = [];
    var baseCount = Math.floor(3 + waveNum * 0.8 * config.countMult);
    var count = Math.min(baseCount, 30);

    for (var i = 0; i < count; i++) {
      var type = 'normal';
      var progress = waveNum / config.totalWaves;

      if (progress > 0.7 && Math.random() < 0.15) type = 'boss';
      else if (progress > 0.4 && Math.random() < 0.25) type = 'tank';
      else if (progress > 0.2 && Math.random() < 0.3) type = 'fast';

      enemies.push({ type: type, spawnDelay: 0.5 + i * 0.3 });
    }
    return enemies;
  }

  function getWaveGoldBonus(waveNum) {
    return 10 + waveNum * 2;
  }

  return {
    configure: configure,
    getTotalWaves: getTotalWaves,
    getWaveEnemies: getWaveEnemies,
    getWaveGoldBonus: getWaveGoldBonus,
    getDifficultyConfig: getDifficultyConfig
  };
})();
```

- [ ] **Step 4: Run runner.html to verify tests pass**

Expected: all wave tests pass.

- [ ] **Step 5: Commit**

```bash
git add step-0-setup/js/waves.js step-0-setup/tests/waves.test.js
git commit -m "feat: wave spawning system"
```

---

### Task 5: Map Generation

**Files:**
- Create: `step-0-setup/js/mapgen.js`
- Create: `step-0-setup/tests/mapgen.test.js`

**Interfaces:**
- Consumes: nothing (standalone pure module)
- Produces: `window.MapGen` module with:
  - `TILE` enum: `{ EMPTY:0, PATH:1, OBSTACLE:2, TOWER:3, START:4, EXIT:5 }`
  - `generateMap(type, seed)` → `{ grid[][], cols, rows, waypoints[], startTile{x,y}, exitTile{x,y}, validTiles[]{x,y} }`
  - `getRandomSeed()` → `number`

- [ ] **Step 1: Write the failing test — `tests/mapgen.test.js`**

```js
(function() {
  var M = window.MapGen;

  TDD.assertEqual(typeof M.generateMap, 'function', 'generateMap exists');
  TDD.assert(typeof M.TILE !== 'undefined', 'TILE enum exists');

  var map = M.generateMap('field', 42);
  TDD.assert(Array.isArray(map.grid), 'grid is array');
  TDD.assert(map.cols > 0 && map.rows > 0, 'map has dimensions');
  TDD.assert(map.cols >= 15 && map.cols <= 25, 'reasonable column count');
  TDD.assert(map.rows >= 15 && map.rows <= 25, 'reasonable row count');

  TDD.assert(map.waypoints.length >= 2, 'has path waypoints');

  // Verify path tiles are walkable
  map.waypoints.forEach(function(wp, i) {
    TDD.assert(wp.x >= 0 && wp.x < map.cols, 'waypoint ' + i + ' x in bounds');
    TDD.assert(wp.y >= 0 && wp.y < map.rows, 'waypoint ' + i + ' y in bounds');
  });

  // Verify different map types produce different grids
  var map2 = M.generateMap('canyon', 42);
  var same = JSON.stringify(map.grid) === JSON.stringify(map2.grid);
  TDD.assert(!same, 'different map types produce different grids with same seed');

  // Verify valid tiles don't overlap path
  map.validTiles.forEach(function(tile) {
    TDD.assert(map.grid[tile.y][tile.x] !== M.TILE.PATH, 'valid tile is not path');
    TDD.assert(map.grid[tile.y][tile.x] !== M.TILE.OBSTACLE, 'valid tile is not obstacle');
  });

  // Obstacle count
  var obstacleCount = 0;
  for (var r = 0; r < map.rows; r++)
    for (var c = 0; c < map.cols; c++)
      if (map.grid[r][c] === M.TILE.OBSTACLE) obstacleCount++;
  TDD.assert(obstacleCount > 0, 'map has obstacles');
})();
```

- [ ] **Step 2: Run runner.html to verify test fails**

Expected: errors about `MapGen` not defined.

- [ ] **Step 3: Create `js/mapgen.js`**

```js
window.MapGen = (function() {
  var TILE = { EMPTY: 0, PATH: 1, OBSTACLE: 2, TOWER: 3, START: 4, EXIT: 5 };

  // Simple seeded random
  function seededRandom(seed) {
    return function() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function getRandomSeed() { return Math.floor(Math.random() * 2147483646) + 1; }

  function generateMap(type, seed) {
    if (!seed) seed = getRandomSeed();
    var rand = seededRandom(seed);

    var cols = 20, rows = 20;

    // Terrain parameters per type
    var params = {
      field:   { pathWidth: 3, obstacleDensity: 0.08, pathWiggle: 0.6, minStraight: 3 },
      canyon:  { pathWidth: 2, obstacleDensity: 0.2,  pathWiggle: 0.3, minStraight: 5 },
      forest:  { pathWidth: 2, obstacleDensity: 0.15, pathWiggle: 0.5, minStraight: 3 },
      plateau: { pathWidth: 3, obstacleDensity: 0.12, pathWiggle: 0.4, minStraight: 4 }
    };
    var p = params[type] || params.field;

    // Initialize grid
    var grid = [];
    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) grid[r][c] = TILE.EMPTY;
    }

    // Generate path using random walk
    var waypoints = [];
    var startX = 0, startY = Math.floor(rows / 2);
    var endX = cols - 1, endY = Math.floor(rows / 2);

    var cx = startX, cy = startY;
    waypoints.push({ x: cx, y: cy });

    var targetX = endX, targetY = endY;
    var maxSteps = cols * 2;
    var step = 0;

    while ((cx !== targetX || cy !== targetY) && step < maxSteps) {
      step++;
      var dx = targetX - cx;
      var dy = targetY - cy;

      if (Math.abs(dx) > Math.abs(dy) && rand() < 0.7) {
        cx += (dx > 0 ? 1 : -1);
      } else if (dy !== 0) {
        cy += (dy > 0 ? 1 : -1);
      } else {
        cx += (dx > 0 ? 1 : -1);
      }

      cx = Math.max(1, Math.min(cols - 2, cx));
      cy = Math.max(1, Math.min(rows - 2, cy));

      // Wiggle
      if (rand() < p.pathWiggle && cx > 1 && cx < cols - 2) {
        cy += (rand() < 0.5 ? 1 : -1);
        cy = Math.max(1, Math.min(rows - 2, cy));
      }

      waypoints.push({ x: cx, y: cy });
    }
    waypoints.push({ x: endX, y: endY });

    // Carve path tiles
    for (var w = 0; w < waypoints.length; w++) {
      var wp = waypoints[w];
      for (var pw = -Math.floor(p.pathWidth / 2); pw <= Math.floor(p.pathWidth / 2); pw++) {
        for (var ph = -Math.floor(p.pathWidth / 2); ph <= Math.floor(p.pathWidth / 2); ph++) {
          var tx = wp.x + pw, ty = wp.y + ph;
          if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
            grid[ty][tx] = TILE.PATH;
          }
        }
      }
    }

    grid[startY][startX] = TILE.START;
    grid[endY][endX] = TILE.EXIT;

    // Place obstacles in periphery (not adjacent to path)
    var validTiles = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c] === TILE.EMPTY) {
          var nearPath = false;
          for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
              var nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (grid[nr][nc] === TILE.PATH || grid[nr][nc] === TILE.START || grid[nr][nc] === TILE.EXIT) nearPath = true;
              }
            }
          }
          if (!nearPath) {
            if (rand() < p.obstacleDensity) grid[r][c] = TILE.OBSTACLE;
            else validTiles.push({ x: c, y: r });
          } else {
            grid[r][c] = TILE.TOWER;
            validTiles.push({ x: c, y: r });
          }
        }
      }
    }

    return {
      grid: grid,
      cols: cols,
      rows: rows,
      waypoints: waypoints,
      startTile: { x: startX, y: startY },
      exitTile: { x: endX, y: endY },
      validTiles: validTiles
    };
  }

  return { TILE: TILE, generateMap: generateMap, getRandomSeed: getRandomSeed };
})();
```

- [ ] **Step 4: Run runner.html to verify tests pass**

- [ ] **Step 5: Commit**

```bash
git add step-0-setup/js/mapgen.js step-0-setup/tests/mapgen.test.js
git commit -m "feat: procedural map generation"
```

---

### Task 6: Game Loop & Canvas Rendering

**Files:**
- Create: `step-0-setup/js/game.js`

**Interfaces:**
- Consumes: `window.Entities.*`, `window.WaveManager.*`, `window.MapGen.*`, `window.GameState.*`, `window.GameUI.*`
- Produces: `window.Game` module with:
  - `init(mapType, difficulty, loadout[])` — configures and builds game state
  - `start()` — begins the game loop
  - `stop()` — stops the loop, returns to menu
  - `pause()` / `resume()` — toggle pause
  - `placeTower(towerId, gridX, gridY)` — places from loadout, costs gold
  - `getTowerAt(gridX, gridY)` — for upgrade UI
  - `upgradeTower(gridX, gridY)` — costs gold, calls tower.upgrade()
  - `startNextWave()` — begins spawning next wave
  - `getGameState()` — returns `{ wave, gold, lives, towers[], enemies[], projectiles[], map, phase }`

- [ ] **Step 1: Create `js/game.js`**

```js
window.Game = (function() {
  var TILE_SIZE = 40;
  var state = null;
  var animId = null;
  var lastTime = 0;
  var spawnTimer = 0;
  var spawnQueue = [];
  var enemies = [];
  var towers = [];
  var projectiles = [];
  var gridTowers = {}; // "x,y" -> tower

  var PHASE = { PRE_GAME: 0, IDLE: 1, WAVE_ACTIVE: 2, WON: 3, LOST: 4 };

  function init(mapType, difficulty, loadout) {
    state = {
      map: window.MapGen.generateMap(mapType),
      config: { mapType: mapType, difficulty: difficulty, loadout: loadout.slice() },
      wave: 0,
      gold: 200,
      lives: 20,
      phase: PHASE.PRE_GAME,
      difficulty: difficulty
    };
    window.WaveManager.configure(difficulty);
    enemies = [];
    towers = [];
    projectiles = [];
    gridTowers = {};
    spawnQueue = [];
    spawnTimer = 0;
    return state;
  }

  function start() {
    state.phase = PHASE.IDLE;
    lastTime = performance.now();
    loop(lastTime);
  }

  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  function pause() { /* no-op: pause not implemented yet */ }
  function resume() { /* no-op */ }

  function loop(time) {
    animId = requestAnimationFrame(loop);
    var dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (state.phase === PHASE.WAVE_ACTIVE) update(dt);
    render();
  }

  function update(dt) {
    // Spawn enemies
    spawnTimer += dt;
    while (spawnQueue.length > 0 && spawnTimer >= spawnQueue[0].spawnDelay) {
      spawnTimer -= spawnQueue[0].spawnDelay;
      var item = spawnQueue.shift();
      var enemy = window.Entities.createEnemy(item.type, state.map.waypoints);
      if (enemy) {
        // Apply difficulty scaling
        var dc = window.WaveManager.getDifficultyConfig();
        enemy.hp *= dc.hpMult;
        enemy.maxHp = enemy.hp;
        enemy.speed *= dc.speedMult;
        enemies.push(enemy);
      }
    }

    // Move enemies
    enemies.forEach(function(enemy) {
      enemy.move(dt);
      if (enemy.reachedEnd() && enemy.alive) {
        enemy.alive = false;
        state.lives--;
      }
    });
    enemies = enemies.filter(function(e) { return e.alive; });

    // Tower targeting and firing
    towers.forEach(function(tower) {
      var target = null;
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.alive) continue;
        var dist = window.Entities.distance(tower.x * TILE_SIZE + TILE_SIZE/2, tower.y * TILE_SIZE + TILE_SIZE/2, e.x, e.y);
        if (dist <= tower.range) { target = e; break; }
      }
      if (target && tower.canFire(time)) {
        tower.fire(time);
        projectiles.push({
          x: tower.x * TILE_SIZE + TILE_SIZE/2,
          y: tower.y * TILE_SIZE + TILE_SIZE/2,
          target: target,
          speed: 300,
          damage: tower.damage,
          special: tower.special,
          alive: true
        });
      }
    });

    // Move projectiles
    projectiles.forEach(function(p) {
      if (!p.alive) return;
      if (!p.target.alive) { p.alive = false; return; }
      var dx = p.target.x - p.x, dy = p.target.y - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        p.target.takeDamage(p.damage);
        if (!p.target.alive) state.gold += p.target.goldValue;
        p.alive = false;
        return;
      }
      var step = p.speed * dt;
      p.x += (dx / dist) * step;
      p.y += (dy / dist) * step;
    });
    projectiles = projectiles.filter(function(p) { return p.alive; });

    // Check win/lose
    if (state.lives <= 0) {
      state.lives = 0;
      state.phase = PHASE.LOST;
    } else if (spawnQueue.length === 0 && enemies.length === 0 && state.wave >= state.config.totalWaves) {
      state.phase = PHASE.WON;
    }
  }

  function render() {
    var canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var map = state.map;
    canvas.width = map.cols * TILE_SIZE;
    canvas.height = map.rows * TILE_SIZE;

    // Draw grid
    for (var r = 0; r < map.rows; r++) {
      for (var c = 0; c < map.cols; c++) {
        var tile = map.grid[r][c];
        var color = '#1a1a2e';
        if (tile === window.MapGen.TILE.PATH) color = '#2d2d44';
        else if (tile === window.MapGen.TILE.OBSTACLE) color = '#444';
        else if (tile === window.MapGen.TILE.TOWER) color = '#1e3a2e';
        else if (tile === window.MapGen.TILE.START) color = '#2d5a2d';
        else if (tile === window.MapGen.TILE.EXIT) color = '#5a2d2d';
        ctx.fillStyle = color;
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw towers
    towers.forEach(function(t) {
      var cx = t.x * TILE_SIZE + TILE_SIZE/2, cy = t.y * TILE_SIZE + TILE_SIZE/2;
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.type[0].toUpperCase() + t.level, cx, cy + 4);
    });

    // Draw enemies
    enemies.forEach(function(e) {
      if (!e.alive) return;
      var hpPct = e.hp / e.maxHp;
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x - 12, e.y - 16, 24 * hpPct, 4);
    });

    // Draw projectiles
    projectiles.forEach(function(p) {
      if (!p.alive) return;
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Update HUD
    var hudWave = document.getElementById('hud-wave');
    var hudGold = document.getElementById('hud-gold');
    var hudLives = document.getElementById('hud-lives');
    if (hudWave) hudWave.textContent = 'Wave ' + state.wave + '/' + state.config.totalWaves;
    if (hudGold) hudGold.textContent = 'Gold: ' + state.gold;
    if (hudLives) hudLives.textContent = 'Lives: ' + state.lives;
  }

  function startNextWave() {
    if (state.phase === PHASE.LOST || state.phase === PHASE.WON) return;
    state.wave++;
    state.phase = PHASE.WAVE_ACTIVE;
    var spawns = window.WaveManager.getWaveEnemies(state.wave);
    spawnQueue = spawns.map(function(s) {
      var type = s.type;
      return { type: type, spawnDelay: 0.5 + Math.random() * 0.3 };
    });
    spawnTimer = 0;
  }

  function placeTower(towerId, gridX, gridY) {
    var key = gridX + ',' + gridY;
    if (gridTowers[key]) return false;
    var def = window.Entities.TOWER_TYPES[towerId];
    if (!def) return false;
    if (state.gold < def.cost) return false;
    var tile = state.map.grid[gridY] && state.map.grid[gridY][gridX];
    if (tile !== window.MapGen.TILE.TOWER) return false;
    var tower = window.Entities.createTower(towerId, gridX, gridY);
    if (!tower) return false;
    state.gold -= def.cost;
    towers.push(tower);
    gridTowers[key] = tower;
    return true;
  }

  function getTowerAt(gridX, gridY) {
    return gridTowers[gridX + ',' + gridY] || null;
  }

  function upgradeTower(gridX, gridY) {
    var tower = getTowerAt(gridX, gridY);
    if (!tower) return false;
    var cost = tower.getUpgradeCost();
    if (cost < 0 || state.gold < cost) return false;
    state.gold -= cost;
    tower.upgrade();
    return true;
  }

  function getGameState() { return state; }

  function initialize(mapType, difficulty, loadout) {
    init(mapType, difficulty, loadout);
  }

  return {
    init: initialize,
    start: start,
    stop: stop,
    pause: pause,
    resume: resume,
    placeTower: placeTower,
    getTowerAt: getTowerAt,
    upgradeTower: upgradeTower,
    startNextWave: startNextWave,
    getGameState: getGameState,
    TILE_SIZE: TILE_SIZE
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add step-0-setup/js/game.js
git commit -m "feat: game loop and canvas rendering"
```

---

### Task 7: UI & Screen Routing

**Files:**
- Create: `step-0-setup/js/ui.js`

**Interfaces:**
- Consumes: `window.GameState.*`, `window.Entities.*`, `window.Game.*`
- Produces: `window.GameUI` module with:
  - `init()` — binds DOM event listeners, shows title screen
  - `showScreen(screenId)` — transitions between screens
  - `populateShop()` — renders shop tower list with buy buttons
  - `populateModeSelect()` — renders map type and difficulty options
  - `populateLoadout()` — renders available towers and 5 loadout slots
  - `setupGameUI()` — binds canvas events, loadout bar, start wave button
  - `showEndScreen(won)` — updates end screen with result

- [ ] **Step 1: Create `js/ui.js`**

```js
window.GameUI = (function() {
  var selectedLoadout = [];
  var selectedMapType = 'field';
  var selectedDifficulty = 'easy';
  var selectedTowerForPlacement = null;

  function init() {
    window.GameState.load();

    // Title screen buttons
    document.getElementById('btn-play').addEventListener('click', function() { showScreen('screen-mode-select'); populateModeSelect(); });
    document.getElementById('btn-shop').addEventListener('click', function() { showScreen('screen-shop'); populateShop(); });
    document.getElementById('btn-tutorial').addEventListener('click', function() { showScreen('screen-tutorial'); });
    document.getElementById('btn-tutorial-close').addEventListener('click', function() { showScreen('screen-title'); });
    document.getElementById('btn-shop-back').addEventListener('click', function() { showScreen('screen-title'); });

    // Mode select
    document.getElementById('btn-mode-confirm').addEventListener('click', function() {
      if (selectedLoadout.length === 0) { alert('Select at least 1 tower'); return; }
      showScreen('screen-loadout');
    });
    document.getElementById('btn-mode-back').addEventListener('click', function() { showScreen('screen-title'); });

    // Loadout
    document.getElementById('btn-loadout-start').addEventListener('click', function() {
      if (selectedLoadout.length === 0) { alert('Select at least 1 tower'); return; }
      startGame();
    });
    document.getElementById('btn-loadout-back').addEventListener('click', function() { showScreen('screen-mode-select'); });

    // Game
    document.getElementById('btn-start-wave').addEventListener('click', function() {
      window.Game.startNextWave();
    });
    document.getElementById('btn-game-quit').addEventListener('click', function() {
      window.Game.stop();
      showScreen('screen-mode-select');
    });

    // End screen
    document.getElementById('btn-end-retry').addEventListener('click', function() {
      startGame();
    });
    document.getElementById('btn-end-menu').addEventListener('click', function() {
      showScreen('screen-title');
    });

    // Canvas click for tower placement / upgrade
    var canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', function(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var mx = (e.clientX - rect.left) * scaleX;
      var my = (e.clientY - rect.top) * scaleY;
      var gridX = Math.floor(mx / window.Game.TILE_SIZE);
      var gridY = Math.floor(my / window.Game.TILE_SIZE);

      // If a tower is selected for placement, try to place
      if (selectedTowerForPlacement) {
        if (window.Game.placeTower(selectedTowerForPlacement, gridX, gridY)) {
          selectedTowerForPlacement = null;
          updateLoadoutBar();
        }
        return;
      }

      // Otherwise, check for existing tower to upgrade
      var existing = window.Game.getTowerAt(gridX, gridY);
      if (existing) {
        var cost = existing.getUpgradeCost();
        if (cost < 0) { alert('Already max level!'); return; }
        if (confirm('Upgrade ' + existing.type + ' to level ' + (existing.level + 1) + ' for $' + cost + '?')) {
          window.Game.upgradeTower(gridX, gridY);
        }
      }
    });

    showScreen('screen-title');
  }

  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    document.getElementById(id).classList.add('active');
    // Resize canvas when showing game screen
    if (id === 'screen-game') {
      setTimeout(function() {
        var canvas = document.getElementById('game-canvas');
        var container = canvas.parentElement;
        var maxW = container.clientWidth * 0.9;
        var maxH = container.clientHeight * 0.7;
        var mapW = window.Game.TILE_SIZE * 20;
        var mapH = window.Game.TILE_SIZE * 20;
        var scale = Math.min(1, maxW / mapW, maxH / mapH);
        canvas.style.width = (mapW * scale) + 'px';
        canvas.style.height = (mapH * scale) + 'px';
      }, 50);
    }
  }

  function populateShop() {
    var coins = window.GameState.getCoins();
    document.getElementById('shop-coins').textContent = 'Coins: ' + coins;
    var list = document.getElementById('shop-tower-list');
    list.innerHTML = '';
    window.Entities.TOWER_IDS.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var owned = window.GameState.isTowerUnlocked(id);
      var div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = def.name + ' - ' + def.cost + ' coins ' + (owned ? '[OWNED]' : '');
      if (!owned) {
        var btn = document.createElement('button');
        btn.textContent = 'Buy';
        btn.addEventListener('click', function() {
          if (window.GameState.spendCoins(def.cost)) {
            window.GameState.unlockTower(id);
            window.GameState.save();
            populateShop();
          } else {
            alert('Not enough coins!');
          }
        });
        div.appendChild(btn);
      }
      list.appendChild(div);
    });
  }

  function populateModeSelect() {
    var mapContainer = document.getElementById('map-type-select');
    mapContainer.innerHTML = '';
    var maps = ['field', 'canyon', 'forest', 'plateau'];
    var mapNames = { field:'Open Field', canyon:'Canyon', forest:'Forest', plateau:'Plateau' };
    maps.forEach(function(id) {
      var btn = document.createElement('button');
      btn.textContent = mapNames[id];
      btn.className = id === selectedMapType ? 'active' : '';
      btn.addEventListener('click', function() {
        selectedMapType = id;
        populateModeSelect();
      });
      mapContainer.appendChild(btn);
    });

    var diffContainer = document.getElementById('difficulty-select');
    diffContainer.innerHTML = '';
    var diffs = ['easy', 'medium', 'hard'];
    var diffNames = { easy:'Easy (25)', medium:'Medium (32)', hard:'Hard (40)' };
    diffs.forEach(function(id) {
      var btn = document.createElement('button');
      btn.textContent = diffNames[id];
      btn.className = id === selectedDifficulty ? 'active' : '';
      btn.addEventListener('click', function() {
        selectedDifficulty = id;
        populateModeSelect();
      });
      diffContainer.appendChild(btn);
    });

    // Populate loadout on mode select screen too for preview
    populateLoadoutSelection();
  }

  function populateLoadoutSelection() {
    var avail = document.getElementById('available-towers');
    if (!avail) return;
    avail.innerHTML = 'Click tower to add: ';
    window.Entities.TOWER_IDS.forEach(function(id) {
      if (!window.GameState.isTowerUnlocked(id)) return;
      var def = window.Entities.TOWER_TYPES[id];
      var btn = document.createElement('button');
      btn.textContent = def.name;
      btn.addEventListener('click', function() {
        if (selectedLoadout.length >= 5) { alert('Loadout full!'); return; }
        if (selectedLoadout.indexOf(id) !== -1) { alert('Already in loadout!'); return; }
        selectedLoadout.push(id);
        populateLoadoutSelection();
        populateLoadoutSlots();
      });
      avail.appendChild(btn);
    });
    populateLoadoutSlots();
  }

  function populateLoadoutSlots() {
    var slots = document.getElementById('loadout-slots');
    if (!slots) return;
    slots.innerHTML = 'Selected: ';
    selectedLoadout.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var span = document.createElement('span');
      span.textContent = '[' + def.name + '] ';
      span.style.margin = '0 8px';
      slots.appendChild(span);
    });
  }

  function setupGameUI() {
    var bar = document.getElementById('game-loadout-bar');
    bar.innerHTML = '';
    selectedLoadout.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var btn = document.createElement('button');
      btn.textContent = 'Place ' + def.name + ' ($' + def.cost + ')';
      btn.setAttribute('data-tower-id', id);
      btn.addEventListener('click', function() {
        selectedTowerForPlacement = id;
        var all = bar.querySelectorAll('button');
        for (var i = 0; i < all.length; i++) all[i].style.borderColor = '#555';
        btn.style.borderColor = '#4fc3f7';
      });
      bar.appendChild(btn);
    });

    var startBtn = document.getElementById('btn-start-wave');
    startBtn.style.display = 'inline-block';
  }

  function updateLoadoutBar() {
    var gs = window.Game.getGameState();
    var bar = document.getElementById('game-loadout-bar');
    var btns = bar.querySelectorAll('button');
    btns.forEach(function(btn) {
      var id = btn.getAttribute('data-tower-id');
      if (id) {
        var def = window.Entities.TOWER_TYPES[id];
        btn.textContent = 'Place ' + def.name + ' ($' + def.cost + ')';
        btn.disabled = gs.gold < def.cost;
      }
    });
  }

  function startGame() {
    window.Game.init(selectedMapType, selectedDifficulty, selectedLoadout);
    showScreen('screen-game');
    setupGameUI();
    // Start checking for win/lose
    var checkInterval = setInterval(function() {
      var gs = window.Game.getGameState();
      if (!gs) return;
      if (gs.phase === 3) { // WON
        clearInterval(checkInterval);
        window.Game.stop();
        var bonus = gs.wave * 10;
        window.GameState.addCoins(bonus);
        window.GameState.recordWin(selectedMapType, selectedDifficulty);
        window.GameState.save();
        showEndScreen(true, bonus);
      } else if (gs.phase === 4) { // LOST
        clearInterval(checkInterval);
        window.Game.stop();
        showEndScreen(false, 0);
      }
    }, 500);
    window.Game.start();
  }

  function showEndScreen(won, coins) {
    document.getElementById('end-title').textContent = won ? 'You Win! +' + coins + ' coins' : 'You Lost!';
    showScreen('screen-end');
  }

  return {
    init: init,
    showScreen: showScreen,
    populateShop: populateShop,
    populateModeSelect: populateModeSelect,
    setupGameUI: setupGameUI,
    showEndScreen: showEndScreen,
    startGame: startGame
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add step-0-setup/js/ui.js
git commit -m "feat: UI module and screen routing"
```

---

### Task 8: Main Entry Point

**Files:**
- Create: `step-0-setup/js/main.js`

**Interfaces:**
- Consumes: `window.GameUI`, `window.GameState`

- [ ] **Step 1: Create `js/main.js`**

```js
(function() {
  window.GameUI.init();
  // Load previous state
  window.GameState.load();
  // First-time players have arrow tower unlocked and 0 coins - earn coins by winning maps
})();
```

- [ ] **Step 2: Commit**

```bash
git add step-0-setup/js/main.js
git commit -m "feat: main entry point"
```

---

### Task 9: Polish, Edge Cases & Verification

**Files:**
- Modify: `step-0-setup/css/style.css` — polish layout, game screen sizing
- Modify: `step-0-setup/js/game.js` — edge case handling (empty loadout, 0 gold, all towers placed)
- Modify: `step-0-setup/js/ui.js` — tooltips, disabled states, path visibility toggle

**Edge cases to handle:**

- [ ] **Step 1: CSS polish**

Add the following to `css/style.css`:
- Game screen layout: canvas centered, HUD and loadout bar styled
- Button disabled state: `button:disabled { opacity: 0.5; cursor: not-allowed; }`
- Active state for mode/difficulty selection: `button.active { border-color: #4fc3f7; background: #1a3a4e; }`
- Shop item styling
- Responsive sizing for the game canvas area

- [ ] **Step 2: Add wave completion gold bonus in `game.js` `update()` function**

Add this block in the `update()` function before the win/lose check (around line 1028):

```js
    // Wave completion gold bonus
    if (spawnQueue.length === 0 && enemies.length === 0 && state.phase === PHASE.WAVE_ACTIVE && state.wave > 0) {
      state.gold += window.WaveManager.getWaveGoldBonus(state.wave);
      state.phase = PHASE.IDLE;
      var startBtn = document.getElementById('btn-start-wave');
      if (startBtn) startBtn.disabled = false;
    }
```

- [ ] **Step 3: Manual verification checklist**

Open `index.html` in browser and verify:
- [ ] Title screen displays with Play, Shop, Tutorial buttons
- [ ] Shop shows towers with buy buttons, coins display updates after purchase
- [ ] Tutorial overlay opens and closes
- [ ] Mode select shows 4 map types and 3 difficulties
- [ ] Loadout screen lets you pick 5 towers, shows selected
- [ ] Game starts with selected map rendered on canvas
- [ ] Clicking a tower in loadout bar selects it for placement
- [ ] Clicking a valid tile places the tower
- [ ] Clicking "Start Wave" spawns enemies that walk the path
- [ ] Towers auto-fire at enemies in range
- [ ] Enemies reaching the exit reduce lives
- [ ] All enemies killed advances to next wave
- [ ] Gold earned from kills and wave completion
- [ ] Upgrading a tower (click tower on map) costs gold and improves stats
- [ ] Lives reaching 0 shows "You Lost" screen with retry/menu
- [ ] All waves cleared shows "You Win" screen with retry/menu
- [ ] Winning awards coins that persist (visible in shop after)

- [ ] **Step 4: Commit**

```bash
git add step-0-setup/css/style.css step-0-setup/js/game.js step-0-setup/js/ui.js
git commit -m "feat: polish, edge case handling, and game completion flow"
```
