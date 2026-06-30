# Per-Wave Enemy Scaling Design

## Problem
Enemy HP/speed uses flat multipliers per difficulty but doesn't ramp over waves. The spec requires per-wave scaling: Easy +10% HP/wave, Hard +20% HP/wave + speed increase.

## Solution
Add per-wave HP and speed multipliers to the difficulty config in `waves.js`. Apply them in `game.js` at spawn time.

## Changes

### `js/waves.js`
Add `perWaveHp` and `perWaveSpeed` to each difficulty entry:
- Easy: `{ perWaveHp: 0.1, perWaveSpeed: 0 }` (10% HP increase per wave, no speed change)
- Medium: `{ perWaveHp: 0, perWaveSpeed: 0 }` (no per-wave scaling)
- Hard: `{ perWaveHp: 0.2, perWaveSpeed: 0.02 }` (20% HP increase per wave, 2% speed increase per wave)

### `js/game.js`
In the spawn logic (update function), after the existing flat multiplier:
```js
enemy.hp *= (1 + dc.perWaveHp * state.wave);
enemy.speed *= (1 + dc.perWaveSpeed * state.wave);
```

## Files Changed
| File | Change |
|------|--------|
| `js/waves.js` | Add perWaveHp, perWaveSpeed to DIFFICULTY config |
| `js/game.js` | Apply per-wave multipliers at spawn time |
| `tests/waves.test.js` | Add tests for per-wave config |
