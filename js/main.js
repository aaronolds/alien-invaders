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

    let player, alienGrid, gameState, lastTime;

    function init() {
        player = new Player(W, H);
        alienGrid = new AlienGrid(W);
        gameState = { state: 'playing', score: 0 };
        lastTime = performance.now();
    }

    function gameLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt
        lastTime = now;

        if (gameState.state === 'playing') {
            player.update(dt, keys);
            alienGrid.update(dt);
            Collision.check(player, alienGrid, gameState);
        }

        // Handle restart
        if ((gameState.state === 'gameOver' || gameState.state === 'won') && keys['Enter']) {
            init();
        }

        // Render
        ctx.clearRect(0, 0, W, H);
        player.draw(ctx);
        alienGrid.draw(ctx);
        HUD.draw(ctx, gameState.score, player.lives, W);

        if (gameState.state === 'gameOver') {
            HUD.drawGameOver(ctx, gameState.score, W, H);
        } else if (gameState.state === 'won') {
            HUD.drawWin(ctx, gameState.score, W, H);
        }

        requestAnimationFrame(gameLoop);
    }

    init();
    requestAnimationFrame(gameLoop);
})();
