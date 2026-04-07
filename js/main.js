(function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Input tracking
    const keys = {};
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        e.preventDefault();
    });
    window.addEventListener('keyup', e => {
        keys[e.code] = false;
    });
    window.addEventListener('keydown', e => {
        if (e.code === 'KeyP') {
            if (gameState && gameState.state === 'playing') {
                gameState.state = 'paused';
            } else if (gameState && gameState.state === 'paused') {
                gameState.state = 'playing';
                lastTime = performance.now();
            }
        }
    });

    let player, alienGrid, shields, gameState, lastTime;

    function init() {
        player = new Player(W, H);
        alienGrid = new AlienGrid(W, getLevelConfig(0));
        shields = createShields(W, player.y - 70);
        gameState = { state: 'playing', score: 0, level: 0, levelTimer: 0, scoreSaved: false };
        lastTime = performance.now();
    }

    function initLevel(level) {
        alienGrid = new AlienGrid(W, getLevelConfig(level));
        shields = createShields(W, player.y - 70);
        lastTime = performance.now();
    }

    function gameLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt
        lastTime = now;

        if (gameState.state === 'playing') {
            player.update(dt, keys);
            alienGrid.update(dt, player.x);
            Collision.check(player, alienGrid, shields, gameState);
        } else if (gameState.state === 'levelComplete') {
            gameState.levelTimer -= dt;
            if (gameState.levelTimer <= 0) {
                gameState.level++;
                initLevel(gameState.level);
                gameState.state = 'playing';
            }
        }

        // Save high score on game over
        if (gameState.state === 'gameOver' && !gameState.scoreSaved) {
            HighScores.add(gameState.score);
            gameState.scoreSaved = true;
        }

        // Handle restart
        if ((gameState.state === 'gameOver' || gameState.state === 'won') && keys['Enter']) {
            init();
        }

        // Render
        ctx.clearRect(0, 0, W, H);
        player.draw(ctx);
        alienGrid.draw(ctx);
        for (const s of shields) s.draw(ctx);
        HUD.draw(ctx, gameState.score, player.lives, W, gameState.level);

        if (gameState.state === 'gameOver') {
            HUD.drawGameOver(ctx, gameState.score, W, H);
        } else if (gameState.state === 'won') {
            HUD.drawWin(ctx, gameState.score, W, H);
        } else if (gameState.state === 'paused') {
            HUD.drawPaused(ctx, W, H);
        } else if (gameState.state === 'levelComplete') {
            HUD.drawLevelComplete(ctx, gameState.level, W, H);
        }

        requestAnimationFrame(gameLoop);
    }

    init();
    requestAnimationFrame(gameLoop);
})();
