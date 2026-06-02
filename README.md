# Arcade 🕹️

A small, zero-runtime-dependency arcade of HTML5 Canvas games behind a launcher.
Written in TypeScript, compiled to plain JavaScript with `tsc` — no bundler.

Games included:

- **Alien Invaders** 👾 — a classic Space Invaders clone.
- **Pong** 🏓 — paddle vs. AI, first to 11.

## Run

```bash
npm install
npm start          # builds (tsc) and serves at http://localhost:3000
```

Then open <http://localhost:3000> and pick a game from the launcher.

To build without serving: `npm run build`.

## Controls

**Launcher** — click a game card.

**Alien Invaders**

| Key | Action |
|-----|--------|
| ← → or A/D | Move ship |
| Spacebar | Shoot |
| P | Pause |
| Esc | Quit to name entry |
| Enter | Restart (after game over or win) |

**Pong**

| Key | Action |
|-----|--------|
| ↑ ↓ or W/S | Move paddle |
| P | Pause |
| Esc | Quit to name entry |
| Enter | Start / play again |

## High scores

Each game has its own leaderboard. Scores are saved by `server.js` to `scores.json`,
keyed by game id, and served via `GET/POST /api/scores`.

## Project structure

```
arcade/
├── index.html              Launcher page
├── css/
│   ├── launcher.css        Launcher styling
│   └── style.css           Shared game-page styling
├── games/
│   ├── alien-invaders/
│   │   └── index.html      Alien Invaders page
│   └── pong/
│       └── index.html      Pong page
├── src/                    TypeScript source (compiled to js/)
│   ├── launcher.ts         Launcher registry + rendering
│   ├── shared/
│   │   ├── types.ts        Cross-game types
│   │   └── scores.ts       HighScores client (per-game)
│   └── games/
│       ├── alien-invaders/ Alien Invaders modules
│       └── pong/main.ts    Pong (self-contained)
├── server.js               Static server + /api/scores
└── scores.json             Per-game high scores
```

## Adding a new game

1. Create `src/games/<id>/main.ts` (a single self-contained IIFE is the simplest,
   collision-free approach). Call `HighScores.configure('<id>')` if it uses scores.
2. Create `games/<id>/index.html` loading your compiled `/js/games/<id>/*.js`
   (and `/js/shared/scores.js` if needed) plus `/css/style.css`.
3. Add an entry to the `GAMES` array in `src/launcher.ts`.
4. `npm run build` and refresh the launcher.

See `.github/copilot-instructions.md` for architecture details.

## License

MIT
