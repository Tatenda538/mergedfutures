# Per-Wave Enemy Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-wave HP and speed scaling so enemies get harder as waves progress.

**Architecture:** Add `perWaveHp` and `perWaveSpeed` fields to the difficulty config in `waves.js`. Apply them in `game.js` at spawn time using the formula `(1 + perWaveRate * waveNum)`.

**Tech Stack:** ES5, existing WaveManager and Game modules.

## Global Constraints

- ES5 only, no transpilers
- All game modules use IIFE pattern with window globals
- All changes inside `step-0-setup/`
- WaveManager and Game modules remain self-contained
- All tests must pass after implementation

---

### Task 1: Add per-wave scaling

**Files:**
- Modify: `step-0-setup/js/waves.js`
- Modify: `step-0-setup/js/game.js`
- Modify: `step-0-setup/tests/waves.test.js`

- [ ] **Step 1: Write the failing test**

In `tests/waves.test.js`, add after line 26 (before the closing `})();`):

```js
  // Per-wave scaling config
  W.configure('easy');
  var dcEasy = W.getDifficultyConfig();
  TDD.assertEqual(dcEasy.perWaveHp, 0.1, 'easy perWaveHp = 0.1');
  TDD.assertEqual(dcEasy.perWaveSpeed, 0, 'easy perWaveSpeed = 0');

  W.configure('medium');
  var dcMed = W.getDifficultyConfig();
  TDD.assertEqual(dcMed.perWaveHp, 0, 'medium perWaveHp = 0');
  TDD.assertEqual(dcMed.perWaveSpeed, 0, 'medium perWaveSpeed = 0');

  W.configure('hard');
  var dcHard = W.getDifficultyConfig();
  TDD.assertEqual(dcHard.perWaveHp, 0.2, 'hard perWaveHp = 0.2');
  TDD.assert(dcHard.perWaveSpeed > 0, 'hard perWaveSpeed > 0');
```

- [ ] **Step 2: Run test to verify it fails**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in Chrome.

Expected: Tests fail because `perWaveHp` and `perWaveSpeed` are undefined in the config.

- [ ] **Step 3: Add perWaveHp and perWaveSpeed to DIFFICULTY config**

In `js/waves.js`, replace lines 9-13 (the DIFFICULTY object):

```js
  var DIFFICULTY = {
    easy:   { totalWaves: 25, hpMult: 0.8, speedMult: 0.8, countMult: 0.7, perWaveHp: 0.1, perWaveSpeed: 0 },
    medium: { totalWaves: 32, hpMult: 1.0, speedMult: 1.0, countMult: 1.0, perWaveHp: 0, perWaveSpeed: 0 },
    hard:   { totalWaves: 40, hpMult: 1.3, speedMult: 1.2, countMult: 1.4, perWaveHp: 0.2, perWaveSpeed: 0.02 }
  };
```

- [ ] **Step 4: Apply per-wave multipliers in game.js**

In `js/game.js`, replace lines 64-68 (inside the spawn logic):

```js
        var dc = window.WaveManager.getDifficultyConfig();
        enemy.hp *= dc.hpMult * (1 + dc.perWaveHp * state.wave);
        enemy.maxHp = enemy.hp;
        enemy.speed *= dc.speedMult * (1 + dc.perWaveSpeed * state.wave);
```

- [ ] **Step 5: Run the test suite**

Open `file:///C:/Users/Test/Documents/GitHub/mergedfutures/step-0-setup/tests/runner.html` in Chrome.

Expected: 815+ tests pass, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add step-0-setup/js/waves.js step-0-setup/js/game.js step-0-setup/tests/waves.test.js
git commit -m "feat: per-wave enemy HP and speed scaling"
```
