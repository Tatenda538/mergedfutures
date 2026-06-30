# Support Tower Design

## Problem
The spec requires 5 tower roles: Scout, Sniper, Slower, Splash, Support. The Support tower (buffs nearby towers' range) is missing.

## Solution
Add a new Support tower type that passively increases the range of nearby towers by a percentage. No attack capability.

## Stats
- Name: Support
- Cost: 100 gold
- Special: `buff`
- Buff radius: 150px
- No damage, no fire rate

## Buff Values by Level
| Level | Range Buff | Upgrade Cost |
|-------|-----------|--------------|
| 1     | +15%      | —            |
| 2     | +25%      | 150 gold     |
| 3     | +35%      | 250 gold     |

## Behavior
- Buff applies passively to all towers within 150px of the Support tower
- Effective range = base range × (1 + buffPercent)
- Multiple overlapping Support towers stack multiplicatively
- Buff is calculated at render/fire time, not stored on the tower

## Files Changed
| File | Change |
|------|--------|
| `js/entities.js` | Add `support` to TOWER_TYPES, update TOWER_IDS |
| `js/game.js` | Apply buff to tower range calculations |
| `tests/entities.test.js` | Add tests for support tower definition |
| `tests/game.test.js` | Add tests for buff application |
