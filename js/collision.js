const Collision = {
    // AABB rectangle overlap test
    rectOverlap(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    },

    check(player, alienGrid, gameState) {
        // Player bullets vs aliens
        for (let bi = player.bullets.length - 1; bi >= 0; bi--) {
            const bullet = player.bullets[bi];
            const br = bullet.getRect();
            for (const alien of alienGrid.aliens) {
                if (!alien.alive) continue;
                const ar = { x: alien.x, y: alien.y, w: alien.width, h: alien.height };
                if (this.rectOverlap(br, ar)) {
                    alien.alive = false;
                    player.bullets.splice(bi, 1);
                    gameState.score += alien.points;
                    break;
                }
            }
        }

        // Alien bullets vs player
        const pr = player.getRect();
        for (let bi = alienGrid.bullets.length - 1; bi >= 0; bi--) {
            const bullet = alienGrid.bullets[bi];
            const br = bullet.getRect();
            if (this.rectOverlap(br, pr)) {
                alienGrid.bullets.splice(bi, 1);
                player.hit();
                if (player.lives <= 0) {
                    gameState.state = 'gameOver';
                }
                break;
            }
        }

        // Aliens reached player row
        if (alienGrid.lowestY() >= player.y) {
            gameState.state = 'gameOver';
        }

        // All aliens dead
        if (alienGrid.allDead()) {
            gameState.state = 'won';
        }
    },
};
