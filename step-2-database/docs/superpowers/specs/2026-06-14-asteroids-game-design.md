# Asteroids Arcade Clone — Design Spec

## Overview
A web-based Asteroids arcade game clone with 100 levels, cyberpunk aesthetic, and timed scoring. Built with Phaser.js (gameplay) and HTML/CSS (level-select menu).

## Architecture

### Page Structure
- `index.html` — single page with two screens:
  - `#menu-screen` — level select grid (HTML/CSS)
  - `#game-screen` — Phaser canvas container
- `main.js` — Phaser config, scene registration, screen switching
- `GameData.js` — thin module wrapping `localStorage` for persist unlock state + best times

### Screens
Only one screen visible at a time. Toggle via `display: none`.

### Phaser Scenes
- **BootScene** — preloads any assets (minimal since we use Graphics primitives)
- **GameScene** — actual gameplay, receives `levelNumber` as init param

## Level Select Screen

- 10×10 CSS grid of numbered level buttons
- Three states per level: **locked** (dimmed/grayed), **unlocked** (neon glow, clickable), **completed** (shows best time below number)
- Level 1 always unlocked
- Click unlocked level → hide menu, start Phaser game at that level
- Cyberpunk styling: dark background (`#0a0a1a`), neon cyan (`#00ffff`) and magenta (`#ff00ff`) borders, subtle glow via `box-shadow` or `text-shadow`

## Gameplay (Phaser GameScene)

### Ship
- Classic triangle shape drawn with Phaser `Graphics` (neon cyan outline)
- Controls: left/right arrow to rotate, up arrow to thrust, space to fire
- Inertia-based movement (no friction, wraps around screen edges)
- Single life — any collision with a rock = game over

### Rocks
- Polygonal shapes drawn with Phaser `Graphics` (neon magenta outline)
- Generated each level based on difficulty params (see below)
- Classic Asteroids splitting: large → 2 medium → 2 small → destroyed
- Rocks wrap around screen edges

### Collisions
- **Bullet vs rock:** rock splits or is destroyed, score (time) unaffected
- **Ship vs rock:** immediate game over

### Timer
- Starts when level begins, displayed top-right in neon-style text
- Stops when all rocks destroyed
- **Time = score.** Lower is better.

### Game Over
- Semi-transparent overlay with "GAME OVER" text
- Click/tap to return to level select

### Level Complete
- All rocks destroyed → timer stops
- Overlay shows "LEVEL COMPLETE" + completion time
- Save best time to `localStorage`
- Unlock next level
- Click/tap to return to level select

## Difficulty Scaling (Levels 1–100)

Level `N` difficulty defined by:

| Parameter | Formula |
|-----------|---------|
| Rock count | `3 + floor(N * 0.15)` (3 → 17 rocks) |
| Rock speed | `60 + N * 2` pixels/sec (60 → 260) |
| Rock min radius | `40 - floor(N * 0.3)` (40 → 10) |
| Rock max radius | `60 - floor(N * 0.4)` (60 → 20) |

Smaller rocks are harder to hit. At higher levels, rocks are faster, more numerous, and smaller.

## Data Persistence

`localStorage` keys:
- `asteroids_unlocked` — highest unlocked level number (integer)
- `asteroids_times` — JSON object mapping `{ "3": 45.2, "5": 32.1, ... }` level → best time

## Visual / Cyberpunk Theme

- Background: very dark blue-black (`#0a0a1a`)
- Ship: neon cyan (`#00ffff`) with slight glow
- Rocks: neon magenta (`#ff00ff`) with slight glow
- UI text: neon cyan, monospace font, with glow effect
- Starfield: randomly generated static dots in background (Phaser Graphics)

## Controls

- **Arrow Left / Arrow Right** — rotate ship
- **Arrow Up** — thrust
- **Space** — fire bullet
- **Click** — navigate menus

## Testing

- Test level data generation functions
- Test `GameData` (localStorage read/write/unlock)
- Test rock splitting logic
- Test difficulty formula produces expected values
- Test game scene state transitions (playing → complete, playing → game over)
