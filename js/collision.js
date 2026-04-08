const Collision = {
    // AABB rectangle overlap test
    rectOverlap(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    },

    check(player, alienGrid, shields, gameState) {
        // Player bullets vs aliens
        for (let bi = player.bullets.length - 1; bi >= 0; bi--) {
            const bullet = player.bullets[bi];
            const br = bullet.getRect();
            let bulletHit = false;
            for (const alien of alienGrid.aliens) {
                if (!alien.alive) continue;
                const ar = { x: alien.x, y: alien.y, w: alien.width, h: alien.height };
                if (this.rectOverlap(br, ar)) {
                    alien.alive = false;
                    player.bullets.splice(bi, 1);
                    gameState.score += alien.points;
                    bulletHit = true;
                    break;
                }
            }
            // Player bullets vs shields
            if (!bulletHit) {
                for (const s of shields) {
                    if (s.hitTestBlast(br, 10)) {
                        player.bullets.splice(bi, 1);
                        break;
                    }
                }
            }
        }

        // Alien bullets vs shields and player
        const pr = player.getRect();
        for (let bi = alienGrid.bullets.length - 1; bi >= 0; bi--) {
            const bullet = alienGrid.bullets[bi];
            const br = bullet.getRect();
            // Check shields first
            let shieldHit = false;
            for (const s of shields) {
                if (s.hitTestBlast(br, 10)) {
                    alienGrid.bullets.splice(bi, 1);
                    shieldHit = true;
                    break;
                }
            }
            if (shieldHit) continue;
            // Then check player
            if (this.rectOverlap(br, pr)) {
                alienGrid.bullets.splice(bi, 1);
                player.hit();
                if (player.lives <= 0) {
                    gameState.state = 'gameOver';
                }
                break;
            }
        }

        // Alien bodies vs player
        for (const alien of alienGrid.aliens) {
            if (!alien.alive) continue;
            const ar = { x: alien.x, y: alien.y, w: alien.width, h: alien.height };
            if (this.rectOverlap(ar, pr)) {
                alien.alive = false;
                gameState.score += alien.points;
                player.hit();
                if (player.lives <= 0) {
                    gameState.state = 'gameOver';
                }
                break;
            }
            // Alien bodies destroy shields
            for (const s of shields) {
                s.hitTestArea(ar);
            }
        }

        // Aliens reached player row
        if (alienGrid.lowestY() >= player.y) {
            gameState.state = 'gameOver';
            return; // Stop processing collisions if game is over
        }

        // All aliens dead — level complete
        if (alienGrid.allDead()) {
            gameState.state = 'levelComplete';
            gameState.levelTimer = 2;
        }
    },
};
