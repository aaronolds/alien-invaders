# Copilot Instructions for Alien Invaders

## Architecture

This is a zero-dependency HTML5 Canvas game using vanilla JavaScript. There is no build system, bundler, or package manager — just open `index.html` in a browser.

Scripts are loaded via `<script>` tags in `index.html` in dependency order. Every file except `main.js` declares globals (classes, objects, or functions) that later scripts depend on. The load order matters:

1. `sprites.js` — global `SPRITES` object, `drawSprite()`, `getSpriteWidth()`, `getSpriteHeight()`
2. `bullet.js` — `Bullet` class (depends on sprite helpers)
3. `player.js` — `Player` class (depends on `Bullet`, `SPRITES`)
4. `alien.js` — `AlienGrid` class (depends on `Bullet`, `SPRITES`)
5. `collision.js` — `Collision` object (stateless, operates on player/alienGrid/gameState)
6. `hud.js` — `HUD` object (renders UI overlays)
7. `main.js` — IIFE that owns the game loop, wires everything together

`main.js` is the only file wrapped in an IIFE. All other files expose their exports as globals.

## Game Loop Pattern

The game uses a `requestAnimationFrame` loop with delta-time (`dt`) in seconds. Every game entity implements `update(dt)` and `draw(ctx)`. The loop runs continuously — game state (`playing`, `gameOver`, `won`) gates whether `update` is called, but `draw` always runs.

## Sprite System

Sprites are 2D arrays of 1s and 0s in the `SPRITES` object. The `drawSprite(ctx, spriteData, x, y, scale, color)` function renders them as colored pixel blocks. All sprites use `scale = 3` for game entities and `scale = 2` for HUD icons. When adding new sprites, keep the 11-column width convention for consistency with existing alien/player sprites.

## Collision

All collision uses AABB (axis-aligned bounding box) via `{ x, y, w, h }` rectangles returned by `getRect()` methods. Entities that participate in collision must expose a `getRect()` method.

## Key Conventions

- Keyboard input is tracked via `e.code` values (e.g., `'ArrowLeft'`, `'KeyA'`, `'Space'`), not `e.key`.
- Bullets are owned by their source: `player.bullets` for player shots, `alienGrid.bullets` for alien shots. Collision logic reaches into both arrays.
- Canvas dimensions are fixed at 800×600 (`index.html` attributes). Code references these as constants `W`/`H` in `main.js` or passes `canvasWidth`/`canvasHeight` as constructor params.
- Private methods are prefixed with `_` (e.g., `_initGrid`, `_getBottomAliens`).
