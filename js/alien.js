class AlienGrid {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.scale = 3;
        this.cols = 11;
        this.rows = 5;
        this.padding = 16;
        this.aliens = [];
        this.direction = 1; // 1 = right, -1 = left
        this.speed = 30;
        this.dropDistance = 20;
        this.bullets = [];
        this.shootInterval = 1.5; // seconds between alien shots
        this.shootTimer = this.shootInterval;

        this._initGrid();
    }

    _initGrid() {
        const alienTypes = [
            { sprite: SPRITES.alien1, points: 30, color: '#f55' },
            { sprite: SPRITES.alien2, points: 20, color: '#ff5' },
            { sprite: SPRITES.alien2, points: 20, color: '#ff5' },
            { sprite: SPRITES.alien3, points: 10, color: '#5ff' },
            { sprite: SPRITES.alien3, points: 10, color: '#5ff' },
        ];

        const startX = 60;
        const startY = 60;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const type = alienTypes[row];
                const w = getSpriteWidth(type.sprite, this.scale);
                const h = getSpriteHeight(type.sprite, this.scale);
                this.aliens.push({
                    x: startX + col * (w + this.padding),
                    y: startY + row * (h + this.padding),
                    width: w,
                    height: h,
                    sprite: type.sprite,
                    points: type.points,
                    color: type.color,
                    alive: true,
                    col: col,
                    row: row,
                });
            }
        }
    }

    update(dt) {
        const living = this.aliens.filter(a => a.alive);
        if (living.length === 0) return;

        // Move horizontally
        let hitEdge = false;
        for (const a of living) {
            a.x += this.speed * this.direction * dt;
        }

        // Check bounds
        for (const a of living) {
            if (a.x + a.width >= this.canvasWidth - 10 || a.x <= 10) {
                hitEdge = true;
                break;
            }
        }

        if (hitEdge) {
            this.direction *= -1;
            for (const a of living) {
                a.y += this.dropDistance;
            }
        }

        // Alien shooting
        this.shootTimer -= dt;
        if (this.shootTimer <= 0 && living.length > 0) {
            this.shootTimer = this.shootInterval * (0.5 + Math.random());
            // Pick a random bottom-most alien per column
            const bottomAliens = this._getBottomAliens(living);
            if (bottomAliens.length > 0) {
                const shooter = bottomAliens[Math.floor(Math.random() * bottomAliens.length)];
                const bx = shooter.x + shooter.width / 2 - 1.5;
                const by = shooter.y + shooter.height;
                this.bullets.push(new Bullet(bx, by, 200, SPRITES.alienBullet, '#f55'));
            }
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(dt);
            if (this.bullets[i].isOffScreen(600)) {
                this.bullets.splice(i, 1);
            }
        }
    }

    _getBottomAliens(living) {
        const colMap = {};
        for (const a of living) {
            if (!colMap[a.col] || a.row > colMap[a.col].row) {
                colMap[a.col] = a;
            }
        }
        return Object.values(colMap);
    }

    draw(ctx) {
        for (const a of this.aliens) {
            if (!a.alive) continue;
            drawSprite(ctx, a.sprite, a.x, a.y, this.scale, a.color);
        }
        for (const b of this.bullets) {
            b.draw(ctx);
        }
    }

    allDead() {
        return this.aliens.every(a => !a.alive);
    }

    lowestY() {
        let maxY = 0;
        for (const a of this.aliens) {
            if (a.alive) {
                maxY = Math.max(maxY, a.y + a.height);
            }
        }
        return maxY;
    }
}
