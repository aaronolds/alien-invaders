class Bullet {
    constructor(x, y, vy, sprite, color) {
        this.x = x;
        this.y = y;
        this.vy = vy;
        this.sprite = sprite;
        this.scale = 3;
        this.color = color;
        this.width = getSpriteWidth(sprite, this.scale);
        this.height = getSpriteHeight(sprite, this.scale);
    }

    update(dt) {
        this.y += this.vy * dt;
    }

    draw(ctx) {
        drawSprite(ctx, this.sprite, this.x, this.y, this.scale, this.color);
    }

    isOffScreen(canvasHeight) {
        return this.y + this.height < 0 || this.y > canvasHeight;
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }
}
