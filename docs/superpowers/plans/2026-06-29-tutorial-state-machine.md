# Tutorial State Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a forced tutorial state machine that runs on game load before the main menu appears.

**Architecture:** New `js/tutorial.js` module (`TutorialManager`) with 6 states (WELCOME → SHOP_INTRO → FORCE_BUY → GHOST_PLACEMENT → SPAWN_ENEMY → COMPLETE). Each state locks irrelevant buttons, pulses the target button, waits for the player action, then advances. On completion, returns to the main menu.

**Tech Stack:** Plain HTML/CSS/JS, canvas game rendering. CSS `.pulse` animation class for button glow. `button.disabled` for locking.

## Global Constraints

- Tutorial runs on every page load before main menu
- Arrow tower pre-unlocked for the tutorial
- Map: Open Field, Easy difficulty
- Only Arrow tower in loadout during tutorial
- On COMPLETE: unlock all buttons, remove all pulse classes, show title screen

---

### Task 1: CSS — Add pulse animation and tutorial overlay styles

**Files:**
- Modify: `step-0-setup/css/style.css`

- [ ] **Step 1: Add `.pulse` keyframe animation and `.locked` style**

Append to `style.css`:

```css
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(79, 195, 247, 0.7); }
  50% { box-shadow: 0 0 20px 5px rgba(79, 195, 247, 0.9); }
  100% { box-shadow: 0 0 0 0 rgba(79, 195, 247, 0.7); }
}
.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
.tutorial-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: #fff;
  font-size: 24px;
  text-align: center;
}
.tutorial-overlay.hidden {
  display: none;
}
.tutorial-message {
  background: #222;
  padding: 2em 3em;
  border-radius: 8px;
  border: 1px solid #4fc3f7;
  max-width: 500px;
}
```

- [ ] **Step 2: Verify the file parses**

The CSS should now contain the new keyframes and class selectors. No errors expected — this is pure CSS.

---

### Task 2: HTML — Add tutorial overlay and script tag

**Files:**
- Modify: `step-0-setup/index.html`

- [ ] **Step 1: Add tutorial overlay div before closing `</body>`**

Insert before the closing `</body>` tag:

```html
  <div id="tutorial-overlay" class="tutorial-overlay hidden">
    <div class="tutorial-message">
      <p id="tutorial-text"></p>
    </div>
  </div>
  <script src="js/tutorial.js"></script>
```

Make sure to insert `tutorial.js` AFTER `ui.js` but BEFORE `main.js` in the script order:

```html
  <script src="js/state.js"></script>
  <script src="js/entities.js"></script>
  <script src="js/waves.js"></script>
  <script src="js/mapgen.js"></script>
  <script src="js/game.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/tutorial.js"></script>
  <script src="js/main.js"></script>
```

And the overlay div goes right before `</body>`.

- [ ] **Step 2: Update test runner to include tutorial.js**

In `tests/runner.html`, add the tutorial.js script tag after ui.js:

```html
  <script src="../js/ui.js"></script>
  <script src="../js/tutorial.js"></script>
  <script src="tdd.js"></script>
```

---

### Task 3: Create tutorial.js — TutorialManager state machine

**Files:**
- Create: `step-0-setup/js/tutorial.js`
- Test: `step-0-setup/tests/tutorial.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/tutorial.test.js`:

```js
(function() {
  var T = window.TutorialManager;
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;
  var assertThrows = TDD.assertThrows;

  // Test that TutorialManager exists and has expected interface
  assert(typeof T === 'object', 'TutorialManager exists');
  assert(typeof T.start === 'function', 'TutorialManager.start is a function');
  assert(typeof T.getState === 'function', 'TutorialManager.getState is a function');
  assert(typeof T.advance === 'function', 'TutorialManager.advance is a function');

  // Test initial state
  assertEqual(T.getState(), 'WELCOME', 'initial state is WELCOME');

  // Test advance changes state
  T.advance();
  assertEqual(T.getState(), 'SHOP_INTRO', 'advance from WELCOME goes to SHOP_INTRO');

  // Test state names
  var states = [];
  while (T.getState() !== 'COMPLETE') {
    states.push(T.getState());
    T.advance();
  }
  assertEqual(states.length, 5, '5 states before COMPLETE (WELCOME, SHOP_INTRO, FORCE_BUY, GHOST_PLACEMENT, SPAWN_ENEMY)');

  // Test advance from COMPLETE is no-op
  var s = T.getState();
  T.advance();
  assertEqual(T.getState(), s, 'advance from COMPLETE does not change state');
})();
```

- [ ] **Step 2: Verify the test fails**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in DevTools.
Expected: Test fails because TutorialManager is not defined.

- [ ] **Step 3: Implement TutorialManager state machine core**

Create `js/tutorial.js`:

```js
window.TutorialManager = (function() {
  var STATES = ['WELCOME', 'SHOP_INTRO', 'FORCE_BUY', 'GHOST_PLACEMENT', 'SPAWN_ENEMY', 'COMPLETE'];
  var currentIndex = 0;

  function getState() {
    return STATES[currentIndex] || 'COMPLETE';
  }

  function advance() {
    if (currentIndex < STATES.length - 1) {
      currentIndex++;
    }
  }

  function reset() {
    currentIndex = 0;
  }

  function start(onComplete) {
    reset();
    enterState(getState(), onComplete);
  }

  function enterState(state, onComplete) {
    switch (state) {
      case 'WELCOME':
        showOverlay('Welcome to Tower Defense!\nGet ready to learn the basics.');
        setTimeout(function() {
          hideOverlay();
          advance();
          enterState(getState(), onComplete);
        }, 2000);
        break;

      case 'SHOP_INTRO':
        showScreen('screen-title');
        lockAllButtons(['btn-shop']);
        addPulse('btn-shop');
        setupOneClickHandler('btn-shop', function() {
          removePulse('btn-shop');
          unlockAllButtons();
          advance();
          enterState(getState(), onComplete);
        });
        break;

      case 'FORCE_BUY':
        showScreen('screen-shop');
        GameUI.populateShop();
        document.querySelectorAll('#shop-tower-list .shop-item button').forEach(function(btn) {
          btn.disabled = true;
        });
        var buyArrow = findBuyButton('arrow');
        if (buyArrow) {
          buyArrow.disabled = false;
          addPulse(buyArrow);
          setupOneClickHandler(buyArrow, function() {
            removePulse(buyArrow);
            advance();
            enterState(getState(), onComplete);
          });
        }
        break;

      case 'GHOST_PLACEMENT':
        Game.init('field', 'easy', ['arrow']);
        showScreen('screen-game');
        setupGhostPlacement(onComplete);
        break;

      case 'SPAWN_ENEMY':
        Game.startNextWave();
        Game.start();
        watchEnemyDeath(onComplete);
        break;

      case 'COMPLETE':
        showOverlay('Tutorial complete!\nYou are ready to play.');
        setTimeout(function() {
          hideOverlay();
          cleanup();
          showScreen('screen-title');
          if (typeof onComplete === 'function') onComplete();
        }, 2500);
        break;
    }
  }

  function showOverlay(text) {
    var el = document.getElementById('tutorial-overlay');
    var textEl = document.getElementById('tutorial-text');
    if (el) el.classList.remove('hidden');
    if (textEl) textEl.innerText = text;
  }

  function hideOverlay() {
    var el = document.getElementById('tutorial-overlay');
    if (el) el.classList.add('hidden');
  }

  function showScreen(id) {
    if (typeof GameUI !== 'undefined' && GameUI.showScreen) {
      GameUI.showScreen(id);
    }
  }

  function lockAllButtons(except) {
    var all = document.querySelectorAll('button');
    all.forEach(function(btn) {
      if (except.indexOf(btn.id) === -1) {
        btn.disabled = true;
      }
    });
  }

  function unlockAllButtons() {
    var all = document.querySelectorAll('button');
    all.forEach(function(btn) {
      btn.disabled = false;
    });
  }

  function addPulse(el) {
    var target = typeof el === 'string' ? document.getElementById(el) : el;
    if (target) target.classList.add('pulse');
  }

  function removePulse(el) {
    var target = typeof el === 'string' ? document.getElementById(el) : el;
    if (target) target.classList.remove('pulse');
  }

  function setupOneClickHandler(el, callback) {
    var target = typeof el === 'string' ? document.getElementById(el) : el;
    if (!target) return;
    function handler() {
      target.removeEventListener('click', handler);
      callback();
    }
    target.addEventListener('click', handler);
  }

  function findBuyButton(towerId) {
    var items = document.querySelectorAll('#shop-tower-list .shop-item');
    for (var i = 0; i < items.length; i++) {
      var btn = items[i].querySelector('button');
      if (btn) {
        var text = items[i].textContent || items[i].innerText;
        if (text.indexOf('Arrow') !== -1 || text.indexOf(towerId) !== -1) {
          return btn;
        }
      }
    }
    return null;
  }

  function setupGhostPlacement(onComplete) {
    var canvas = document.getElementById('game-canvas');
    var map = Game.getGameState().map;
    var tileSize = Game.TILE_SIZE;

    // Find first valid tower tile near center
    var targetTile = null;
    var centerX = Math.floor(map.cols / 2);
    var centerY = Math.floor(map.rows / 2);
    var bestDist = Infinity;
    for (var r = 0; r < map.rows; r++) {
      for (var c = 0; c < map.cols; c++) {
        if (map.grid[r][c] === MapGen.TILE.TOWER) {
          var d = Math.abs(c - centerX) + Math.abs(r - centerY);
          if (d < bestDist) {
            bestDist = d;
            targetTile = { x: c, y: r };
          }
        }
      }
    }

    showOverlay('Now place your Arrow tower on the highlighted tile.');

    // Draw ghost preview and highlight target
    function renderGhost() {
      var ctx = canvas.getContext('2d');
      // Redraw map first (Game.render already does this, but we overlay)
      // Highlight target tile
      if (targetTile) {
        ctx.fillStyle = 'rgba(79, 195, 247, 0.3)';
        ctx.fillRect(targetTile.x * tileSize, targetTile.y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetTile.x * tileSize, targetTile.y * tileSize, tileSize, tileSize);
        // Draw ghost tower
        ctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
        ctx.beginPath();
        ctx.arc(targetTile.x * tileSize + tileSize/2, targetTile.y * tileSize + tileSize/2, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Hook into game render by adding post-render callback
    var origRender = null;
    if (canvas) {
      renderGhost();
    }

    // Click handler for target tile
    function clickHandler(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var mx = (e.clientX - rect.left) * scaleX;
      var my = (e.clientY - rect.top) * scaleY;
      var gridX = Math.floor(mx / tileSize);
      var gridY = Math.floor(my / tileSize);

      if (targetTile && gridX === targetTile.x && gridY === targetTile.y) {
        Game.placeTower('arrow', gridX, gridY);
        canvas.removeEventListener('click', clickHandler);
        hideOverlay();
        advance();
        enterState(getState(), onComplete);
      }
      // Other clicks silently ignored
    }

    canvas.addEventListener('click', clickHandler);
  }

  function watchEnemyDeath(onComplete) {
    var interval = setInterval(function() {
      var gs = Game.getGameState();
      if (!gs) return;
      if (gs.phase === 3) {
        clearInterval(interval);
        Game.stop();
        advance();
        enterState(getState(), onComplete);
      } else if (gs.phase === 4) {
        clearInterval(interval);
        Game.stop();
        showOverlay('The enemy escaped! Towers prevent that.\nTry again in the real game.');
        setTimeout(function() {
          hideOverlay();
          advance();
          enterState(getState(), onComplete);
        }, 3000);
      }
    }, 500);
  }

  function cleanup() {
    removePulse('btn-shop');
    removePulse(document.querySelector('#shop-tower-list .shop-item button'));
    unlockAllButtons();
    hideOverlay();
  }

  return {
    start: start,
    getState: getState,
    advance: advance,
    reset: reset
  };
})();
```

- [ ] **Step 4: Verify tests pass**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in DevTools.
Expected: Tests pass, including the new tutorial tests.

---

### Task 4: Hook tutorial into startup flow

**Files:**
- Modify: `step-0-setup/js/main.js`

- [ ] **Step 1: Modify main.js to run tutorial before GameUI**

Replace the existing `main.js` content:

```js
(function() {
  window.GameState.load();
  window.TutorialManager.start(function() {
    window.GameUI.init();
  });
})();
```

- [ ] **Step 2: Verify tutorial runs on page load**

Reload the game page. Expected: Tutorial starts (welcome overlay appears). After tutorial completes, main menu is shown.

- [ ] **Step 3: Verify main menu works after tutorial**

After tutorial completes, click Play. Expected: Mode select screen appears normally.

---

### Task 5: Edge case — tutorial uses no coin while forcing buy on Arrow

**Files:**
- Modify: `step-0-setup/js/state.js`

- [ ] **Step 1: Ensure Arrow tower is unlocked and player has enough coins**

In `state.js`, modify the `reset()` and initial state to start with 100 coins so the player can afford the Arrow (cost 50) during the tutorial. Also ensure Arrow is unlocked.

```js
var state = {
  coins: 100,
  unlockedTowers: ['arrow'],
  wins: {}
};
```

And in `reset()`:
```js
function reset() {
  state.coins = 100;
  state.unlockedTowers = ['arrow'];
  state.wins = {};
}
```

- [ ] **Step 2: Verify the buy succeeds in tutorial**

During the FORCE_BUY state, clicking the Buy button for Arrow should succeed (not show "Not enough coins!").

---

### Task 6: Integration verification

**Files:**
- Play the complete tutorial

- [ ] **Step 1: Play through the full tutorial**

Reload the game page. Walk through:
1. WELCOME overlay appears for 2s
2. Title screen shows, only Shop button is clickable and pulsing
3. Click Shop → shop screen shows, only Arrow Buy button is clickable
4. Click Buy → screen transitions to game map with ghost placement overlay
5. Click the highlighted tile → Arrow placed
6. Enemy spawns, Arrow fires, enemy dies
7. "Tutorial complete!" → main menu appears
8. Main menu buttons (Play, Shop, Tutorial) all work normally

- [ ] **Step 2: Run existing tests**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html`.
Expected: All existing tests pass (should still be 740+ count).
