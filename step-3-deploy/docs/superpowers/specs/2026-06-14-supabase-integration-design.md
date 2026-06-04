# Supabase Integration Design

## Overview

Connect the Asteroids game to Supabase to track individual progress and global high scores. Users enter their email and a screen name (hashed as a unique identifier — not a login), then access the level select. Progress and high scores are driven by Supabase with background sync.

## Data Model

### Table: `players`
- `id` — uuid, PK, default `gen_random_uuid()`
- `hashed_id` — text, unique — SHA-256 hex digest of the user's email
- `screen_name` — text
- `created_at` — timestamptz, default `now()`

### Table: `scores`
- `id` — uuid, PK, default `gen_random_uuid()`
- `player_id` — uuid, FK → `players.id` ON DELETE CASCADE
- `level` — int2
- `time` — float4 (completion time in seconds, lower is better)
- `created_at` — timestamptz, default `now()`
- Unique constraint: `(player_id, level)` — one best time per level per player

### RLS
- `players`: INSERT and SELECT for anon (authenticated role not used)
- `scores`: INSERT and SELECT for anon. Upsert on `(player_id, level)` conflict.

No real auth — this is a tech demo. Anon key is sufficient.

## Auth / Local Login

A new module `LoginScreen` manages an inline form (email input + screen name input + Enter button). On submit:

1. SHA-256 hash the email → `player.hashedId`
2. Upsert into `players` table by `hashed_id`
3. Store `{ hashedId, screenName }` in localStorage
4. Transition to level-select screen

On page load: if localStorage has a stored player, skip directly to level select. A "Log Out" button on the level-select screen clears localStorage and shows the login form again.

## Background Sync Queue

- `SyncQueue.js` — an in-memory array (backed by localStorage for crash safety) of pending score writes
- On level completion, `ScoreManager` determines if the time is a personal best (check localStorage first, then query Supabase). If it is, push `{ playerId, level, time }` onto the queue.
- A periodic flush runs every 5 seconds. Each entry is sent to Supabase via upsert on `(player_id, level)`. On success, entry removed from queue. On failure, entry stays for next retry.
- The queue is serialized to localStorage so pending writes survive page refreshes.

## Sync Status Indicator

A small status indicator in the top-right corner of the level-select screen:
- **Green dot** — queue empty, all synced
- **Yellow dot** — actively flushing
- **Red dot + count** — pending entries waiting to sync

A simple periodic check of queue state drives the visual.

## Leaderboard Modal

Each level tile gets a small leaderboard icon (trophy/leaderboard symbol). Clicking it opens a modal overlay showing:
- Top 10 scores for that level (rank, screen name, formatted time)
- Close button + click outside to dismiss

Data is fetched from Supabase fresh each time the modal opens. No caching.

## Existing Code Migration

- Extend `GameData.js`: the existing localStorage logic remains the source of truth. On level completion, after updating localStorage, call `ScoreManager` to push a sync entry.
- No existing tests need to change. New modules get their own tests.

## Testing

Unit tests for:
- `SyncQueue`: enqueue, flush, retry-on-fail, localStorage persistence
- `LoginScreen` logic: hashing, upsert, localStorage load/save/clear
- `ScoreManager`: personal-best detection

Integration tests are out of scope — this is a manual verification step via browser.
