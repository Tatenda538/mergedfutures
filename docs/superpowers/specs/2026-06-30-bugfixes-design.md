# Bug Fixes Design

## Fix 1: Tutorial force-buy bug
**File:** `js/tutorial.js`
**Problem:** When Arrow is already owned, `findBuyButton('arrow')` returns null. The FORCE_BUY state gets stuck — no click handler is set up, so the tutorial never advances.
**Fix:** In the FORCE_BUY case, after `findBuyButton`, if `buyArrow` is null (tower already owned), call `advance()` and `enterState()` immediately.

## Fix 2: Empty loadout handling
**File:** `js/ui.js`
**Problem:** Starting a game with no towers selected passes an empty loadout array to `Game.init`. The game would start with no towers available.
**Fix:** In `startGame()`, if `selectedLoadout.length === 0`, default to `['arrow']`.

## Fix 3: End screen verification
**File:** None (verification only)
**Verify:** End screen shows "You Win! +X coins" or "You Lost!" with Retry/Menu buttons.

## Fix 4: Shop display verification
**File:** None (verification only)
**Verify:** Shop only shows unlocked towers.

## Files Changed
| File | Change |
|------|--------|
| `js/tutorial.js` | Skip FORCE_BUY if tower already owned |
| `js/ui.js` | Default to `['arrow']` if loadout empty |
