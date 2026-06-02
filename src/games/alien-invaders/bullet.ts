class Bullet {
    x: number;
    y: number;
    vy: number;
    sprite: SpriteData;
    scale: number;
    color: string;
    width: number;
    height: number;

    constructor(x: number, y: number, vy: number, sprite: SpriteData, color: string) {
        this.x = x;
        this.y = y;
        this.vy = vy;
        this.sprite = sprite;
        this.scale = 3;
        this.color = color;
        this.width = getSpriteWidth(sprite, this.scale);
        this.height = getSpriteHeight(sprite, this.scale);
    }

    update(dt: number): void {
        this.y += this.vy * dt;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        drawSprite(ctx, this.sprite, this.x, this.y, this.scale, this.color);
    }

    isOffScreen(canvasHeight: number): boolean {
        return this.y + this.height < 0 || this.y > canvasHeight;
    }

    getRect(): Rect {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }
}
