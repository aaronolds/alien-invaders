// Pixel-art sprite definitions and rendering helper
// Each sprite is a 2D array of 1s and 0s

const SPRITES: Record<string, SpriteData> = {
    player: [
        [0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
    ],

    alien1: [ // top row — 30 pts
        [0,0,1,0,0,0,0,0,1,0,0],
        [0,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,1,0,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,1],
        [0,0,0,1,1,0,1,1,0,0,0],
    ],

    alien2: [ // middle rows — 20 pts
        [0,0,0,1,0,0,0,1,0,0,0],
        [0,0,0,0,1,0,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,1,1,0,1,0,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,1,1,1,1,1,0,1,0],
        [0,1,0,1,0,0,0,1,0,1,0],
        [0,0,0,0,1,0,1,0,0,0,0],
    ],

    alien3: [ // bottom rows — 10 pts
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,0,0,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,0,1,0,1,0,1,0,1,0,0],
        [0,1,0,1,0,0,0,1,0,1,0],
    ],

    playerBullet: [
        [1],
        [1],
        [1],
        [1],
    ],

    alienBullet: [
        [1],
        [0],
        [1],
        [0],
        [1],
    ],

    seahawk: [
        [0,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,1,0,0,0,1,1,0,0],
        [0,1,1,1,1,0,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,0,1,1],
        [1,0,0,0,1,1,1,0,0,0,1],
        [0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,1,0,1,0,0,0,0],
    ],
};

function drawSprite(ctx: CanvasRenderingContext2D, spriteData: SpriteData, x: number, y: number, scale: number, color: string): void {
    ctx.fillStyle = color;
    for (let row = 0; row < spriteData.length; row++) {
        for (let col = 0; col < spriteData[row].length; col++) {
            if (spriteData[row][col]) {
                ctx.fillRect(
                    x + col * scale,
                    y + row * scale,
                    scale,
                    scale
                );
            }
        }
    }
}

function getSpriteWidth(spriteData: SpriteData, scale: number): number {
    return spriteData[0].length * scale;
}

function getSpriteHeight(spriteData: SpriteData, scale: number): number {
    return spriteData.length * scale;
}
