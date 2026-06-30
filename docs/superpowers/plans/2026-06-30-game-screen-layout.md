# Game Screen Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the game screen to match the prompt's visual layout: top HUD bar, canvas (left) + shop sidebar (right), loadout bar (5 slots), controls bar.

**Architecture:** CSS Grid layout with DOM-based sidebar and loadout bar. The game screen uses `grid-template-rows: auto 1fr auto auto` / `grid-template-columns: 1fr 250px`.

**Tech Stack:** Plain HTML/CSS/JS, CSS Grid for layout.

## Global Constraints

- Game screen layout: Top HUD bar (lives, wave, coins) | Canvas (left) + 250px sidebar (right) | 5-slot loadout bar | controls bar
- Right sidebar shows all unlocked towers as icon+price cards; info panel below shows selected tower stats
- Bottom loadout bar has 5 visual slots; clicking selects tower for placement
- Sidebar tower cards show: icon (first letter), name, cost. Info panel shows: damage, range, fire rate, special
- Unlocked towers shown normally; locked towers greyed out with "???" label
- Empty loadout slots show "[Empty]" in grey

---

### Task 1: HTML — Add sidebar and loadout container elements

**Files:**
- Modify: `step-0-setup/index.html`

- [ ] **Step 1: Add new game screen layout containers**

In `index.html`, replace the current game screen (`#screen-game`) content:

```html
  <!-- Game Screen -->
  <div id="screen-game" class="screen">
    <div id="game-hud"><span id="hud-lives">Lives: 20</span> | <span id="hud-wave">Wave 0/0</span> | <span id="hud-gold">Gold: 0</span></div>
    <div id="game-main">
      <canvas id="game-canvas"></canvas>
      <div id="game-sidebar">
        <h3>Shop</h3>
        <div id="shop-list"></div>
        <div id="tower-info">
          <p id="tower-info-text">Select a tower to view details.</p>
        </div>
      </div>
    </div>
    <div id="game-loadout-bar"></div>
    <div id="game-controls">
      <button id="btn-start-wave">Start Wave</button>
      <button id="btn-game-quit">Quit</button>
    </div>
  </div>
```

Remove the old HUD and loadout elements that are now redundant. The old structure had:
```html
  <div id="screen-game" class="screen">
    <div id="game-hud"><span id="hud-wave">Wave 0/0</span> | <span id="hud-gold">Gold: 0</span> | <span id="hud-lives">Lives: 20</span></div>
    <canvas id="game-canvas"></canvas>
    <div id="game-loadout-bar"></div>
    <button id="btn-start-wave">Start Wave</button>
    <button id="btn-game-quit">Quit</button>
  </div>
```

- [ ] **Step 2: Update test runner to include layout test**

No changes needed — layout test will be added separately.

---

### Task 2: CSS — Game screen grid layout, sidebar, loadout slots

**Files:**
- Modify: `step-0-setup/css/style.css`

- [ ] **Step 1: Add grid layout and sidebar styles**

Replace the game screen layout section in `style.css` (lines 13-20) with:

```css
/* Game screen layout - CSS Grid */
#screen-game {
  display: none;
  width: 100%; height: 100vh;
  position: absolute; top: 0; left: 0;
  flex-direction: column;
}
#screen-game.active {
  display: flex;
}
#game-hud {
  width: 100%; text-align: center; padding: 8px;
  background: #1a1a2e; font-size: 18px;
  display: flex; justify-content: center; gap: 20px;
}
#game-main {
  flex: 1;
  display: flex;
  min-height: 0;
}
#game-canvas {
  background: #1a1a2e; display: block;
  margin: 10px; border: 1px solid #333;
  flex: 1;
  max-width: calc(100% - 270px);
}
#game-sidebar {
  width: 250px;
  background: #1a1a2e;
  border-left: 1px solid #333;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
#game-sidebar h3 {
  text-align: center;
  color: #4fc3f7;
  margin-bottom: 8px;
  font-size: 18px;
}
#shop-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.shop-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #222;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.shop-card:hover {
  border-color: #4fc3f7;
}
.shop-card.locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.shop-card.selected {
  border-color: #4fc3f7;
  background: #1a3a4e;
}
.shop-card-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: #333;
  border-radius: 50%;
  font-weight: bold;
  color: #4fc3f7;
  flex-shrink: 0;
}
.shop-card-info {
  flex: 1;
  font-size: 13px;
}
.shop-card-name {
  font-weight: bold;
  font-size: 14px;
}
.shop-card-cost {
  color: #ffeb3b;
  font-size: 12px;
}
.shop-card-locked-label {
  color: #888;
  font-style: italic;
  font-size: 11px;
}
#tower-info {
  background: #222;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  font-size: 13px;
  min-height: 80px;
}
#tower-info-text {
  color: #aaa;
}
#game-loadout-bar {
  width: 100%;
  padding: 8px;
  background: #1a1a2e;
  display: flex;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid #333;
}
.loadout-slot {
  width: 80px; height: 60px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #222;
  border: 2px solid #444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.loadout-slot:hover {
  border-color: #4fc3f7;
}
.loadout-slot.active {
  border-color: #4fc3f7;
  background: #1a3a4e;
  animation: pulse 1.5s ease-in-out infinite;
}
.loadout-slot.empty {
  border-color: #333;
  color: #555;
  cursor: default;
}
.loadout-slot-icon {
  font-size: 18px;
  font-weight: bold;
  color: #4fc3f7;
}
.loadout-slot-name {
  font-size: 10px;
  color: #ccc;
  margin-top: 2px;
}
#game-controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #1a1a2e;
  border-top: 1px solid #333;
}
#btn-start-wave {
  font-size: 16px; padding: 8px 24px;
  background: #2d5a2d;
}
#btn-game-quit {
  font-size: 16px; padding: 8px 24px;
}
```

- [ ] **Step 2: Remove old game screen styles**

Remove these old styles that are now redundant:

```css
/* OLD - remove these lines */
#game-canvas { margin: 10px auto; border: 1px solid #333; }
#game-loadout-bar button { margin: 4px; min-width: 100px; }
#btn-start-wave { font-size: 18px; padding: 12px 32px; background: #2d5a2d; }
#btn-game-quit { position: absolute; top: 10px; right: 10px; }
```

---

### Task 3: JS — Update setupGameUI to render sidebar and loadout slots

**Files:**
- Modify: `step-0-setup/js/ui.js`

- [ ] **Step 1: Update setupGameUI to render visual loadout slots**

Replace the existing `setupGameUI()` function:

```js
  function setupGameUI() {
    var bar = document.getElementById('game-loadout-bar');
    bar.innerHTML = '';
    selectedLoadout.forEach(function(id, index) {
      var def = window.Entities.TOWER_TYPES[id];
      var slot = document.createElement('div');
      slot.className = 'loadout-slot';
      slot.setAttribute('data-tower-id', id);
      slot.setAttribute('data-slot', index);
      slot.innerHTML = '<div class="loadout-slot-icon">' + def.name[0] + '</div><div class="loadout-slot-name">' + def.name + '</div>';
      slot.addEventListener('click', function() {
        selectedTowerForPlacement = id;
        var all = bar.querySelectorAll('.loadout-slot');
        all.forEach(function(s) { s.classList.remove('active'); });
        slot.classList.add('active');
      });
      bar.appendChild(slot);
    });
    // Fill remaining empty slots
    for (var i = selectedLoadout.length; i < 5; i++) {
      var empty = document.createElement('div');
      empty.className = 'loadout-slot empty';
      empty.innerHTML = '[Empty]';
      bar.appendChild(empty);
    }
    updateSidebar();
  }
```

- [ ] **Step 2: Add updateSidebar and drawSidebar functions**

Add new functions after `setupGameUI()`:

```js
  function updateSidebar() {
    var list = document.getElementById('shop-list');
    if (!list) return;
    list.innerHTML = '';
    window.Entities.TOWER_IDS.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var owned = window.GameState.isTowerUnlocked(id);
      var card = document.createElement('div');
      card.className = 'shop-card' + (owned ? '' : ' locked');
      card.innerHTML =
        '<div class="shop-card-icon">' + def.name[0] + '</div>' +
        '<div class="shop-card-info">' +
          '<div class="shop-card-name">' + (owned ? def.name : '???') + '</div>' +
          '<div class="shop-card-cost">' + (owned ? '$' + def.cost : 'Locked') + '</div>' +
        '</div>';
      if (owned) {
        card.addEventListener('click', function() {
          showTowerInfo(id);
        });
      }
      list.appendChild(card);
    });
  }

  function showTowerInfo(id) {
    var def = window.Entities.TOWER_TYPES[id];
    var infoText = document.getElementById('tower-info-text');
    if (!infoText || !def) return;
    infoText.innerHTML =
      '<b>' + def.name + '</b><br>' +
      'Damage: ' + def.damage + '<br>' +
      'Range: ' + def.range + '<br>' +
      'Fire Rate: ' + def.fireRate + 'ms<br>' +
      'Special: ' + def.special;
  }
```

- [ ] **Step 3: Update updateLoadoutBar to highlight slots**

Replace the existing `updateLoadoutBar()`:

```js
  function updateLoadoutBar() {
    var gs = window.Game.getGameState();
    var bar = document.getElementById('game-loadout-bar');
    if (!bar) return;
    var slots = bar.querySelectorAll('.loadout-slot');
    slots.forEach(function(slot) {
      var id = slot.getAttribute('data-tower-id');
      if (id) {
        var def = window.Entities.TOWER_TYPES[id];
        var canAfford = gs.gold >= def.cost;
        slot.style.opacity = canAfford ? '1' : '0.5';
      }
    });
  }
```

- [ ] **Step 4: Update HUD rendering in game.js's render()**

In `js/game.js`, the render function updates HUD elements. Ensure it uses the new HUD structure:

In the `render()` function in `game.js`, replace the HUD update block:

```js
    var hudWave = document.getElementById('hud-wave');
    var hudGold = document.getElementById('hud-gold');
    var hudLives = document.getElementById('hud-lives');
    if (hudWave) hudWave.textContent = 'Wave ' + state.wave + '/' + state.config.totalWaves;
    if (hudGold) hudGold.textContent = 'Gold: ' + state.gold;
    if (hudLives) hudLives.textContent = 'Lives: ' + state.lives;
```

---

### Task 4: Tests — Verify the new layout elements render correctly

**Files:**
- Create: `step-0-setup/tests/layout.test.js`

- [ ] **Step 1: Write test for layout elements**

Create `tests/layout.test.js`:

```js
(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  // Check game screen has the expected layout containers
  var gameScreen = document.getElementById('screen-game');
  assert(!!gameScreen, 'game screen exists');

  var hud = document.getElementById('game-hud');
  assert(!!hud, 'game-hud exists');

  var main = document.getElementById('game-main');
  assert(!!main, 'game-main exists');

  var canvas = document.getElementById('game-canvas');
  assert(!!canvas, 'game-canvas exists');

  var sidebar = document.getElementById('game-sidebar');
  assert(!!sidebar, 'game-sidebar exists');

  var shopList = document.getElementById('shop-list');
  assert(!!shopList, 'shop-list exists');

  var towerInfo = document.getElementById('tower-info');
  assert(!!towerInfo, 'tower-info exists');

  var loadoutBar = document.getElementById('game-loadout-bar');
  assert(!!loadoutBar, 'game-loadout-bar exists');

  var controls = document.getElementById('game-controls');
  assert(!!controls, 'game-controls exists');

  var startBtn = document.getElementById('btn-start-wave');
  assert(!!startBtn, 'btn-start-wave exists');

  var quitBtn = document.getElementById('btn-game-quit');
  assert(!!quitBtn, 'btn-game-quit exists');

  // Verify HUD elements
  var hudLives = document.getElementById('hud-lives');
  var hudWave = document.getElementById('hud-wave');
  var hudGold = document.getElementById('hud-gold');
  assert(!!hudLives, 'hud-lives exists');
  assert(!!hudWave, 'hud-wave exists');
  assert(!!hudGold, 'hud-gold exists');

  // Verify sidebar structure
  assert(sidebar.querySelector('h3') !== null, 'sidebar has h3 title');
  assert(shopList.children.length > 0, 'shop-list has tower cards (at least Arrow)');
})();
```

- [ ] **Step 2: Add layout test to test runner**

In `tests/runner.html`, add:

```html
  <script src="layout.test.js"></script>
```

Before `window.TDD.report();`.

---

### Task 5: Update tutorial.js for new layout

**Files:**
- Modify: `step-0-setup/js/tutorial.js`

- [ ] **Step 1: Update FORCE_BUY state**

The FORCE_BUY state in `tutorial.js` currently finds the buy button in the old shop screen structure. Since the in-game shop is now in the sidebar, the tutorial's FORCE_BUY should still use the old separate shop screen. No change needed — the tutorial uses `showScreen('screen-shop')` and `GameUI.populateShop()` which still exist for the main menu shop.

- [ ] **Step 2: Verify tutorial still works**

Reload the game page and confirm the tutorial still works end-to-end. The tutorial uses the old shop screen (separate), so it should be unaffected.

---

### Task 6: Integration verification

**Files:**
- Full game test run

- [ ] **Step 1: Start a game and verify layout**

1. Complete the tutorial
2. Click Play → Select mode → Select loadout → Start Game
3. Verify: top HUD bar shows lives/wave/gold
4. Verify: canvas on the left
5. Verify: right sidebar shows shop with tower cards
6. Verify: clicking a tower card shows info in the panel
7. Verify: bottom loadout has 5 visual slots
8. Verify: clicking a loadout slot selects it (blue highlight)
9. Verify: Start Wave and Quit buttons are in the controls bar

- [ ] **Step 2: Run all tests**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html`.
Expected: All tests pass.
