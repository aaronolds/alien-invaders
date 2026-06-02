# Copilot Instructions for the Arcade

## Overview

This is a zero-runtime-dependency **arcade** that hosts multiple HTML5 Canvas games
behind a launcher. It is written in **TypeScript** and compiled with `tsc` (the only
dev dependency) to plain global-script JavaScript. There is no bundler.

- Source lives in `src/` and compiles to `js/` (`rootDir: src`, `outDir: js`; `js/` is
  gitignored). Run `npm run build` (or `npm start` to build + serve).
- `server.js` is a tiny Node `http` server: it serves static files and a per-game
  high-score API.

## Launcher + per-game pages

The root `index.html` is the **launcher**: a grid of cards rendered by `js/launcher.js`
from a `GAMES` registry in `src/launcher.ts`. Each card links to `/games/<id>/`, which
the server resolves to that game's `games/<id>/index.html`.

**Each game is a separate HTML page** that loads only its own scripts. This is
deliberate: every game uses global classes/objects (`Player`, `AlienGrid`, etc.), so
keeping one game per page avoids global-name collisions at runtime.

```
index.html                     Launcher page
css/launcher.css               Launcher styling
css/style.css                  Shared game-page styling (black bg, canvas, back-link)
games/<id>/index.html          One page per game (loads /js/... via absolute paths)
src/
  launcher.ts                  Launcher registry + card rendering (IIFE)
  shared/
    types.ts                   Cross-game types: Rect, ScoreEntry, SpriteData
    scores.ts                  HighScores client (game-namespaced)
  games/<id>/*.ts              Per-game source
js/                            Compiled output mirroring src/ (gitignored)
server.js                      Static serving + /api/scores
scores.json                    { "<game-id>": [ { name, score } ] }
```

## Avoiding compile-time global collisions

All `.ts` files compile together under one `tsconfig` as **global scripts** (no
`import`/`export`). That means top-level identifiers share one namespace at compile
time, even across games that never load on the same page. To prevent duplicate-identifier
errors:

- **Truly shared** values/types go in `src/shared/` and are declared exactly once
  (`HighScores`, `Rect`, `ScoreEntry`, `SpriteData`).
- A game that needs new globals (like Alien Invaders) must use unique top-level names.
- **Preferred for new games:** wrap the *entire* game in a single IIFE file and declare
  its classes/interfaces *inside* the function scope (see `src/games/pong/main.ts`).
  Locally-scoped declarations introduce **zero new globals**, so a new game can freely
  reuse generic names without colliding with any other game.

If a future game grows too large to keep fully local, the next step is a per-game
`tsconfig` (separate compile units) or an ES-module migration.

## Game loop pattern

Each game uses a `requestAnimationFrame` loop with delta-time (`dt`) in seconds, capped
per frame. Entities implement `update(dt)` / `draw(ctx)`. Game state gates whether
`update` runs, but `draw` always runs. The typical state machine is
`enterName → playing → (paused) → gameOver/won`, with `Escape` returning to name entry.

## High scores (per game)

`HighScores` (in `src/shared/scores.ts`) is namespaced per game. Each game calls
`HighScores.configure('<game-id>')` once at startup; the client then sends that id with
every request:

- `GET /api/scores?game=<id>` → that game's top-10 list.
- `POST /api/scores` with `{ game, name, score }` → upsert + return the updated list.

`server.js` stores scores in `scores.json` as an object keyed by game id (it migrates a
legacy flat array into `{ "alien-invaders": [...] }`) and validates the game id against
`/^[a-z0-9-]+$/`.

## Alien Invaders specifics

- Sprites are 2D arrays of 1s/0s in the global `SPRITES` object; `drawSprite(ctx, data,
  x, y, scale, color)` renders them as colored pixel blocks (scale 3 for entities, 2 for
  HUD). Keep the 11-column width convention for new sprites.
- Collision is AABB via `{ x, y, w, h }` rects from `getRect()` methods.
- Bullets are owned by their source: `player.bullets` and `alienGrid.bullets`.
- Private methods are prefixed with `_` (e.g., `_initGrid`).

## Adding a new game

1. Create `src/games/<id>/` (a single self-contained IIFE `main.ts` is the simplest,
   collision-free approach). Call `HighScores.configure('<id>')` if it uses scores.
2. Create `games/<id>/index.html` loading `/js/shared/scores.js` (if needed) and your
   compiled `/js/games/<id>/*.js` via absolute paths, plus `/css/style.css`.
3. Add an entry to the `GAMES` registry in `src/launcher.ts`.
4. `npm run build` and verify at `http://localhost:3000/`.

## Conventions

- Keyboard input is tracked via `e.code` values (e.g., `'ArrowLeft'`, `'KeyW'`,
  `'Space'`), not `e.key`.
- Canvas dimensions are fixed per game via `index.html` attributes (Alien Invaders
  1024×768, Pong 800×600); code reads them from the canvas element.
