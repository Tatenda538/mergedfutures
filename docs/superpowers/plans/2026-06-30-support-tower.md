# Support Tower Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Support tower that passively buffs nearby towers' range by a percentage that scales with level.

**Architecture:** Add `support` tower definition to `entities.js`. Add `getEffectiveRange()` function to `game.js` that checks for nearby Support towers and applies range buff. Update targeting logic to use effective range.

**Tech Stack:** ES5, existing Entities and Game modules.

## Global Constraints

- ES5 only, no transpilers
- All game modules use IIFE pattern with window globals
- All changes inside `step-0-setup/`
- Entities and Game modules remain self-contained
- All tests must pass after implementation

---

### Task 1: Add support tower definition

**Files:**
- Modify: `step-0-setup/js/entities.js`
- Modify: `step-0-setup/tests/entities.test.js`

- [ ] **Step 1: Write the failing test**

In `tests/entities.test.js`, add after line 42 (before the closing `})();`):

```js
  // Support tower
  var support = E.createTower('support', 2, 3);
  TDD.assert(support !== null, 'support tower created');
  TDD.assertEqual(support.type, 'support', 'support type set');
  TDD.assertEqual(support.special, 'buff', 'support special is buff');
  TDD.assertEqual(support.damage, 0, 'support has no damage');
  TDD.assertEqual(support.fireRate, 0, 'support has no fire rate');
```

- [ ] **Step 2: Run test to verify it fails**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in Chrome.

Expected: Tests fail because `support` tower type doesn't exist.

- [ ] **Step 3: Add support tower to TOWER_TYPES**

In `js/entities.js`, add to the TOWER_TYPES object (after the mortar entry):

```js
    support: { name:'Support', cost:100, range:150, damage:0, fireRate:0, special:'buff', upgradeCosts:[150,250], upgradeDamage:[0,0], upgradeRange:[150,150], upgradeFireRate:[0,0] }
```

- [ ] **Step 4: Add support to TOWER_IDS**

In `js/entities.js`, update line 18:

```js
  var TOWER_IDS = ['arrow','cannon','ice','sniper','tesla','mortar','support'];
```

- [ ] **Step 5: Run the test suite**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in Chrome.

Expected: 821+ tests pass, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add step-0-setup/js/entities.js step-0-setup/tests/entities.test.js
git commit -m "feat: add support tower definition"
```

---

### Task 2: Apply buff to tower range

**Files:**
- Modify: `step-0-setup/js/game.js`
- Modify: `step-0-setup/tests/game.test.js`

- [ ] **Step 1: Write the failing test**

In `tests/game.test.js`, add after line 68 (before the closing `})();`):

```js
  // Support tower buff
  var supportTower = E.createTower('support', 0, 0);
  var nearbyTower = E.createTower('arrow', 1, 0);
  var farTower = E.createTower('arrow', 10, 10);

  var baseRange = nearbyTower.range;
  var effectiveNear = G.getEffectiveRange(nearbyTower, [supportTower]);
  var effectiveFar = G.getEffectiveRange(farTower, [supportTower]);

  assert(effectiveNear > baseRange, 'nearby tower gets range buff');
  assertEqual(effectiveFar, baseRange, 'far tower unaffected');

  // Test buff scales with level
  supportTower.level = 2;
  var effectiveLv2 = G.getEffectiveRange(nearbyTower, [supportTower]);
  assert(effectiveLv2 > effectiveNear, 'level 2 buff stronger than level 1');

  supportTower.level = 3;
  var effectiveLv3 = G.getEffectiveRange(nearbyTower, [supportTower]);
  assert(effectiveLv3 > effectiveLv2, 'level 3 buff stronger than level 2');

  // Test multiple overlapping support towers
  var support2 = E.createTower('support', 0, 1);
  var effectiveMulti = G.getEffectiveRange(nearbyTower, [supportTower, support2]);
  assert(effectiveMulti > effectiveLv3, 'multiple supports stack');
```

- [ ] **Step 2: Run test to verify it fails**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in Chrome.

Expected: Tests fail because `getEffectiveRange` doesn't exist.

- [ ] **Step 3: Add getEffectiveRange function to game.js**

In `js/game.js`, add before the return statement (around line 246):

```js
  var BUFF_RADIUS = 150;
  var BUFF_VALUES = { 1: 0.15, 2: 0.25, 3: 0.35 };

  function getEffectiveRange(tower, allTowers) {
    var range = tower.range;
    for (var i = 0; i < allTowers.length; i++) {
      var other = allTowers[i];
      if (other.special !== 'buff') continue;
      var dist = window.Entities.distance(
        tower.x * TILE_SIZE + TILE_SIZE / 2,
        tower.y * TILE_SIZE + TILE_SIZE / 2,
        other.x * TILE_SIZE + TILE_SIZE / 2,
        other.y * TILE_SIZE + TILE_SIZE / 2
      );
      if (dist <= BUFF_RADIUS) {
        var buffPercent = BUFF_VALUES[other.level] || BUFF_VALUES[1];
        range *= (1 + buffPercent);
      }
    }
    return range;
  }
```

- [ ] **Step 4: Export getEffectiveRange**

In `js/game.js`, add to the return object:

```js
    getEffectiveRange: getEffectiveRange,
```

- [ ] **Step 5: Update targeting logic to use getEffectiveRange**

In `js/game.js`, replace lines 86-87 (the range check in the tower targeting loop):

```js
        var effRange = getEffectiveRange(tower, towers);
        if (dist <= effRange) { target = e; break; }
```

- [ ] **Step 6: Run the test suite**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in Chrome.

Expected: 830+ tests pass, 0 failures.

- [ ] **Step 7: Commit**

```bash
git add step-0-setup/js/game.js step-0-setup/tests/game.test.js
git commit -m "feat: apply support tower range buff to targeting"
```
