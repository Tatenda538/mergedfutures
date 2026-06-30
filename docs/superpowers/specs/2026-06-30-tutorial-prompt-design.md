# Tutorial Prompt Design

## Problem
The tutorial auto-runs on every page load before showing the main menu. The spec requires a welcome screen that lets the user choose whether to take the tutorial.

## Solution
Add a `#screen-welcome` overlay that appears before the title screen with a clear yes/no choice.

## Architecture
- **New HTML**: `#screen-welcome` in `index.html` — a `.screen.overlay` with heading text and two buttons (`btn-welcome-yes`, `btn-welcome-no`)
- **Modified JS** (`main.js`): On load, show welcome screen instead of immediately starting the tutorial. `btn-welcome-yes` starts the tutorial (same flow as before). `btn-welcome-no` skips directly to `GameUI.init()` (title screen).
- **Modified test** (`startup.test.js`): Update to simulate clicking "Skip" and verify `GameUI.init` is called.

## State Flow
```
Page Load → Welcome Screen → [Yes] → Tutorial → Main Menu
                             → [No]  → Main Menu
```

## Files Changed
| File | Change |
|------|--------|
| `index.html` | Add `#screen-welcome` overlay with buttons |
| `css/style.css` | No changes needed — `.screen.overlay` already styled |
| `js/main.js` | Show welcome screen, route button clicks |
| `tests/startup.test.js` | Update to click "Skip", verify init called |

## No Changes To
- Tutorial state machine (`js/tutorial.js`)
- UI module (`js/ui.js`)
- Existing screen routing
