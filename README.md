# Alien Invaders 👾

A classic Space Invaders clone built with HTML5 Canvas and vanilla JavaScript. No dependencies, no build tools — just open and play.

## Play

Open `index.html` in any modern browser.

## Controls

| Key | Action |
|-----|--------|
| ← → or A/D | Move ship |
| Spacebar | Shoot |
| Enter | Restart (after game over or win) |

## Features

- Pixel-art sprites rendered entirely in code
- 5 rows × 11 columns of aliens with three distinct types
- Aliens move as a group, descending when they hit the edges
- Aliens fire back at random intervals
- Score system (10 / 20 / 30 points per alien type)
- 3 lives with brief invulnerability on hit
- Game over and victory screens

## Project Structure

```
alien-invaders/
├── index.html        Entry point
├── css/
│   └── style.css     Minimal styling
└── js/
    ├── sprites.js    Pixel-art sprite data & rendering helper
    ├── bullet.js     Bullet class for player and alien projectiles
    ├── player.js     Player ship movement and shooting
    ├── alien.js      Alien grid logic and AI
    ├── collision.js  AABB collision detection
    ├── hud.js        Score, lives, and overlay screens
    └── main.js       Game loop and state management
```

## License

MIT
