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

        // ESC to quit current game and return to name entry
        if (e.code === 'Escape' && gameState && gameState.state !== 'enterName') {
            if (gameState.score > 0 && gameState.playerName && !gameState.scoreSaved) {
                HighScores.add(gameState.playerName, gameState.score);
            }
            initEnterName();
        }

        // Name entry input
        if (gameState && gameState.state === 'enterName') {
            if (e.code === 'Backspace') {
                gameState.playerName = gameState.playerName.slice(0, -1);
            } else if (e.code === 'Enter' && gameState.playerName.length > 0) {
                startGame();
            } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key) && gameState.playerName.length < 10) {
                gameState.playerName += e.key.toUpperCase();
            }
        }
    });

    let player, alienGrid, shields, gameState, lastTime;

    function initEnterName() {
        gameState = { state: 'enterName', playerName: '', score: 0, level: 0, levelTimer: 0, scoreSaved: false };
        HighScores.refresh();
    }

    function startGame() {
        player = new Player(W, H);
        alienGrid = new AlienGrid(W, H, getLevelConfig(0));
        shields = createShields(W, player.y - 70);
        gameState.state = 'playing';
        gameState.score = 0;
        gameState.level = 0;
        gameState.levelTimer = 0;
        gameState.scoreSaved = false;
        lastTime = performance.now();
    }

    function initLevel(level) {
        alienGrid = new AlienGrid(W, H, getLevelConfig(level));
        shields = createShields(W, player.y - 70);
        lastTime = performance.now();
    }

    function gameLoop(now) {
        if (gameState.state === 'enterName') {
            ctx.clearRect(0, 0, W, H);
            HUD.drawEnterName(ctx, gameState.playerName, W, H);
            requestAnimationFrame(gameLoop);
            return;
        }

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

        // Save high score on game over or win
        if ((gameState.state === 'gameOver' || gameState.state === 'won') && !gameState.scoreSaved) {
            HighScores.add(gameState.playerName, gameState.score);
            gameState.scoreSaved = true;
        }

        // Handle restart — go back to name entry for a new player
        if ((gameState.state === 'gameOver' || gameState.state === 'won') && keys['Enter']) {
            initEnterName();
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

    initEnterName();
    requestAnimationFrame(gameLoop);
})();
