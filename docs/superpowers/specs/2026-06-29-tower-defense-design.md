# Tower Defense Game — Design Spec

## Tech Stack
- Plain HTML, CSS, JavaScript (no frameworks)
- Canvas-based game rendering, DOM-based menus/UI
- localStorage for persistence
- Single-file entry point: `index.html`

## Screen Flow

```
Title Screen → Mode Select → Loadout → Game → End Screen
                  ↑                              │
                  └──────────────────────────────┘
```

1. **Title Screen** — Game title, Play button, Shop button, Tutorial button
2. **Mode Select** — Choose map type (Open Field / Canyon / Forest / Plateau) + difficulty (Easy / Medium / Hard) — Easy = 25 waves, Medium = 32, Hard = 40. Difficulty also scales enemy health, speed, and per-wave quantity.
3. **Loadout** — Player picks 5 towers from their unlocked collection for the upcoming run
4. **Game** — Active gameplay on canvas with HUD and loadout bar
5. **End Screen** — "You Win" or "You Lost" message, buttons for Retry and Back to Menu

**Tutorial** is a readme-style text overlay, accessible from the title screen.

## Currencies

| Currency | Persistence | Earned | Spent On |
|----------|-------------|--------|----------|
| **Coins** | Permanent (localStorage) | Map completion (win) | Shop — unlocking new towers |
| **Gold** | Per-run only | Enemy kills + wave completion | In-game — deploying & upgrading towers |

Gold is awarded per kill (amount varies by enemy type) and a bonus at wave completion. Zero coins on loss.

## Map Generation (Procedural)

Grid-based. For each map type, a path is generated first from a start edge to an exit edge using a modified random walk. The path is represented as a series of connected tiles. After the path is placed, obstacles (walls, rocks, trees, elevations) are placed in peripheral tiles — not in tower-placement zones adjacent to the path, so player sightlines are never blocked.

| Map Type     | Terrain Theme              | Path Characteristics       |
|--------------|----------------------------|----------------------------|
| Open Field   | Sparse rocks, flat         | Winding, wide corridors    |
| Canyon       | Dense wall clusters         | Narrow, twisty path        |
| Forest       | Tree patches                | Medium width, tree-lined   |
| Plateau      | Elevated sections           | Variable width, choke points|

The same generation code powers all four — only parameters differ per type.

## Tower System

### Tower Types

| Tower   | Cost (Gold) | Range   | Damage  | Fire Rate | Special              |
|---------|-------------|---------|---------|-----------|----------------------|
| Arrow   | Cheap       | Medium  | Medium  | Fast      | None                 |
| Cannon  | Medium      | Medium  | High    | Slow      | Splash AoE           |
| Ice     | Medium      | Medium  | Low     | Medium    | Slows enemies        |
| Sniper  | Expensive   | Very    | Very Hi | Very Slow | Single-target focus  |
| Tesla   | Expensive   | Short   | Medium  | Medium    | Chain lightning (3 targets) |
| Mortar  | Medium      | Very Hi | High    | Slow      | Lobbed AoE, slight inaccuracy |

### Upgrades
Each tower has 3 levels (L1 → L2 → L3). Upgrading increases damage, range, and/or fire rate. Bought with Gold during gameplay.

### Loadout
Before each run, the player selects 5 unlocked towers for their loadout. Only those 5 can be deployed in that game, by dragging/clicking from the bottom loadout bar onto valid terrain tiles.

## Enemy System

- Enemies spawn at the path start and follow waypoints to the exit
- Types: **Normal** (balanced), **Fast** (high speed, low HP), **Tank** (slow, high HP), **Boss** (very high HP, appears later waves)
- Each enemy that reaches the exit costs 1 life
- Player starts with 20 lives
- Win: survive all waves with ≥1 life. Lose: lives reach 0.

## UI Layout (Game Screen)

```
┌──────────────────────────────────────┐
│ Wave 3/25 │ Gold: 450 │ Lives: 20    │  ← HUD top
├──────────────────────────────────────┤
│                                      │
│           GAME CANVAS                │
│     (map tiles, towers, enemies,     │
│      projectiles, VFX)               │
│                                      │
├──────────────────────────────────────┤
│ Loadout: │  │  │  │  │  │            │  ← Bottom bar
└──────────────────────────────────────┘
```

- **Canvas** fills the center area
- **HUD** at top: wave counter, gold, lives
- **Loadout bar** at bottom: 5 deployable tower slots, click to select then click map to place
- Click a deployed tower to open upgrade UI (if enough gold)

## Architecture (File Structure)

```
step-0-setup/
├── index.html          — entry point, screen containers
├── css/
│   └── style.css       — all styles
└── js/
    ├── main.js         — app init, screen routing between screens
    ├── state.js        — game state, persistence (localStorage)
    ├── mapgen.js       — procedural map generation
    ├── game.js         — game loop (update + render via requestAnimationFrame)
    ├── entities.js     — Tower, Enemy, Projectile classes
    ├── waves.js        — wave spawning logic & definitions
    └── ui.js           — HUD, loadout bar, menu rendering & event handlers
```

## Persistence (localStorage Keys)
- `td_unlocked_towers` — array of tower type IDs the player owns
- `td_coins` — permanent coin balance
- `td_completed_levels` — tracking which map+difficulty combos have been beaten

## Game Loop
`requestAnimationFrame` with delta-time updates. Each frame:
1. Spawn enemies per wave schedule
2. Move enemies along path waypoints
3. Towers auto-target nearest enemy in range — fire if cooldown ready
4. Move projectiles — check collisions with enemies
5. Apply damage, check kills, award gold
6. Check lives (enemies reaching exit), check win/lose
7. Render everything

## Edge Cases & States
- **Empty loadout:** Player must pick at least 1 tower before starting (disable Start button)
- **No gold:** Show greyed-out deploy/upgrade options with tooltip
- **All towers placed:** If all 5 loadout towers are on the map, prevent further placement
- **Path visibility:** Option to toggle path highlights during placement
- **Browser refresh during game:** Run state is lost (no mid-game save)
- **First-time player:** Start with 1 starter tower (Arrow) unlocked and 0 coins — tutorial prompt on title screen
