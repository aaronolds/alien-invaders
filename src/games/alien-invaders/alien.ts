class AlienGrid {
    canvasWidth: number;
    canvasHeight: number;
    scale: number;
    cols: number;
    rows: number;
    padding: number;
    aliens: Alien[];
    direction: number;
    speed: number;
    dropDistance: number;
    bullets: Bullet[];
    shootInterval: number;
    shootTimer: number;
    speedBoostPerDrop: number;
    divebombEnabled: boolean;
    divebombRate: number;
    maxDivebombers: number;
    divebombTimer: number;

    constructor(canvasWidth: number, canvasHeight: number, levelConfig: LevelConfig) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.scale = 3;
        this.cols = 11;
        this.rows = 5;
        this.padding = 16;
        this.aliens = [];
        this.direction = 1; // 1 = right, -1 = left
        this.speed = levelConfig.speed;
        this.dropDistance = 20;
        this.bullets = [];
        this.shootInterval = levelConfig.shootInterval;
        this.shootTimer = this.shootInterval;
        this.speedBoostPerDrop = levelConfig.speedBoostPerDrop;

        // Divebomb config
        this.divebombEnabled = levelConfig.divebombEnabled;
        this.divebombRate = levelConfig.divebombRate;
        this.maxDivebombers = levelConfig.maxDivebombers;
        this.divebombTimer = this.divebombRate;

        this._initGrid();
    }

    _initGrid(): void {
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
                    divebombing: false,
                    divebombPhase: null,
                    homeX: 0,
                    homeY: 0,
                });
            }
        }

        // Randomly convert 4-5 aliens into seahawk type
        const count = 4 + Math.floor(Math.random() * 2);
        const indices: number[] = [];
        while (indices.length < count) {
            const i = Math.floor(Math.random() * this.aliens.length);
            if (!indices.includes(i)) indices.push(i);
        }
        for (const i of indices) {
            const a = this.aliens[i];
            a.sprite = SPRITES.seahawk;
            a.points = 100;
            a.color = '#69BE28';
            a.width = getSpriteWidth(a.sprite, this.scale);
            a.height = getSpriteHeight(a.sprite, this.scale);
        }
    }

    update(dt: number, playerX: number): void {
        const living = this.aliens.filter(a => a.alive);
        if (living.length === 0) return;

        const gridAliens = living.filter(a => !a.divebombing);

        // Move grid aliens horizontally
        let hitEdge = false;
        for (const a of gridAliens) {
            a.x += this.speed * this.direction * dt;
        }

        // Check bounds on grid aliens only
        for (const a of gridAliens) {
            if (a.x + a.width >= this.canvasWidth - 10) {
                hitEdge = true;
                // Clamp to right edge to prevent getting stuck
                const overshoot = (a.x + a.width) - (this.canvasWidth - 10);
                for (const g of gridAliens) g.x -= overshoot;
                break;
            } else if (a.x <= 10) {
                hitEdge = true;
                // Clamp to left edge
                const overshoot = 10 - a.x;
                for (const g of gridAliens) g.x += overshoot;
                break;
            }
        }

        if (hitEdge) {
            this.direction *= -1;
            this.speed += this.speedBoostPerDrop;
            for (const a of gridAliens) {
                a.y += this.dropDistance;
            }
        }

        // Update home positions for all living aliens (grid aliens track their current pos)
        for (const a of gridAliens) {
            a.homeX = a.x;
            a.homeY = a.y;
        }

        // Divebomb trigger
        if (this.divebombEnabled) {
            this.divebombTimer -= dt;
            const activeDivers = living.filter(a => a.divebombing).length;
            if (this.divebombTimer <= 0 && activeDivers < this.maxDivebombers) {
                this.divebombTimer = this.divebombRate * (0.5 + Math.random());
                const candidates = gridAliens.filter(a => !a.divebombing);
                if (candidates.length > 0) {
                    const diver = candidates[Math.floor(Math.random() * candidates.length)];
                    diver.divebombing = true;
                    diver.divebombPhase = 'descending';
                    diver.homeX = diver.x;
                    diver.homeY = diver.y;
                    diver.divebombTargetX = playerX;
                }
            }
        }

        // Update divebombing aliens
        for (const a of living.filter(a => a.divebombing)) {
            const diveSpeed = this.speed * 6;
            if (a.divebombPhase === 'descending') {
                a.y += diveSpeed * dt;
                // Steer toward target x
                const dx = (a.divebombTargetX ?? a.x) - a.x;
                a.x += Math.sign(dx) * Math.min(Math.abs(dx), diveSpeed * 0.8 * dt);
                // Past bottom of screen — start returning
                if (a.y > this.canvasHeight + 20) {
                    a.divebombPhase = 'returning';
                }
            } else if (a.divebombPhase === 'returning') {
                // Move back toward home position
                const dx = a.homeX - a.x;
                const dy = a.homeY - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5) {
                    a.x = a.homeX;
                    a.y = a.homeY;
                    a.divebombing = false;
                    a.divebombPhase = null;
                } else {
                    const returnSpeed = diveSpeed * 1.2;
                    a.x += (dx / dist) * returnSpeed * dt;
                    a.y += (dy / dist) * returnSpeed * dt;
                }
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
            if (this.bullets[i].isOffScreen(this.canvasHeight)) {
                this.bullets.splice(i, 1);
            }
        }
    }

    _getBottomAliens(living: Alien[]): Alien[] {
        const colMap: Record<number, Alien> = {};
        for (const a of living) {
            if (!colMap[a.col] || a.row > colMap[a.col].row) {
                colMap[a.col] = a;
            }
        }
        return Object.values(colMap);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const a of this.aliens) {
            if (!a.alive) continue;
            drawSprite(ctx, a.sprite, a.x, a.y, this.scale, a.color);
        }
        for (const b of this.bullets) {
            b.draw(ctx);
        }
    }

    allDead(): boolean {
        return this.aliens.every(a => !a.alive);
    }

    lowestY(): number {
        let maxY = 0;
        for (const a of this.aliens) {
            if (a.alive && !a.divebombing) {
                maxY = Math.max(maxY, a.y + a.height);
            }
        }
        return maxY;
    }
}
