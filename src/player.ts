class Player {
    scale: number;
    sprite: SpriteData;
    width: number;
    height: number;
    x: number;
    y: number;
    speed: number;
    canvasWidth: number;
    canvasHeight: number;
    shootCooldown: number;
    shootRate: number;
    bullets: Bullet[];
    lives: number;
    invulnerable: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.scale = 3;
        this.sprite = SPRITES.player;
        this.width = getSpriteWidth(this.sprite, this.scale);
        this.height = getSpriteHeight(this.sprite, this.scale);
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height - 20;
        this.speed = 300;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.shootCooldown = 0;
        this.shootRate = 0.4; // seconds between shots
        this.bullets = [];

        this.lives = 3;
        this.invulnerable = 0; // seconds of invulnerability remaining
    }

    update(dt: number, keys: Record<string, boolean>): void {
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x -= this.speed * dt;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x += this.speed * dt;
        }

        // Clamp to canvas
        this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));

        // Shooting
        this.shootCooldown -= dt;
        if ((keys['Space']) && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootRate;
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(dt);
            if (this.bullets[i].isOffScreen(this.canvasHeight)) {
                this.bullets.splice(i, 1);
            }
        }

        // Invulnerability timer
        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }
    }

    shoot(): void {
        const bx = this.x + this.width / 2 - 1.5;
        const by = this.y - 12;
        this.bullets.push(new Bullet(bx, by, -400, SPRITES.playerBullet, '#0f0'));
    }

    hit(): boolean {
        if (this.invulnerable > 0) return false;
        this.lives--;
        this.invulnerable = 2;
        return true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Blink when invulnerable
        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) {
            return;
        }
        drawSprite(ctx, this.sprite, this.x, this.y, this.scale, '#0f0');

        // Draw bullets
        for (const b of this.bullets) {
            b.draw(ctx);
        }
    }

    getRect(): Rect {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }
}
