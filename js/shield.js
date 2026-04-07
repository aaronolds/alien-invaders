class Shield {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.blockSize = 3;
        this.cols = 22;
        this.rows = 16;
        this.width = this.cols * this.blockSize;
        this.height = this.rows * this.blockSize;
        this.blocks = this._initBlocks();
    }

    _initBlocks() {
        // Classic arch shape
        const grid = [];
        for (let r = 0; r < this.rows; r++) {
            grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                // Top rounded corners
                if (r < 3 && (c < 3 - r || c >= this.cols - 3 + r)) {
                    grid[r][c] = false;
                }
                // Bottom archway cutout
                else if (r >= this.rows - 5 && c >= 6 && c < this.cols - 6) {
                    grid[r][c] = false;
                } else {
                    grid[r][c] = true;
                }
            }
        }
        return grid;
    }

    hitTest(rect) {
        // Check if a rect overlaps any live block, destroy blocks it touches
        let hit = false;
        const bx1 = Math.floor((rect.x - this.x) / this.blockSize);
        const by1 = Math.floor((rect.y - this.y) / this.blockSize);
        const bx2 = Math.floor((rect.x + rect.w - 1 - this.x) / this.blockSize);
        const by2 = Math.floor((rect.y + rect.h - 1 - this.y) / this.blockSize);

        for (let r = Math.max(0, by1); r <= Math.min(this.rows - 1, by2); r++) {
            for (let c = Math.max(0, bx1); c <= Math.min(this.cols - 1, bx2); c++) {
                if (this.blocks[r][c]) {
                    this.blocks[r][c] = false;
                    hit = true;
                }
            }
        }
        return hit;
    }

    // Destroy a larger area for alien body collisions
    hitTestArea(rect) {
        let hit = false;
        const bx1 = Math.floor((rect.x - this.x) / this.blockSize) - 1;
        const by1 = Math.floor((rect.y - this.y) / this.blockSize) - 1;
        const bx2 = Math.floor((rect.x + rect.w - 1 - this.x) / this.blockSize) + 1;
        const by2 = Math.floor((rect.y + rect.h - 1 - this.y) / this.blockSize) + 1;

        for (let r = Math.max(0, by1); r <= Math.min(this.rows - 1, by2); r++) {
            for (let c = Math.max(0, bx1); c <= Math.min(this.cols - 1, bx2); c++) {
                if (this.blocks[r][c]) {
                    this.blocks[r][c] = false;
                    hit = true;
                }
            }
        }
        return hit;
    }

    draw(ctx) {
        ctx.fillStyle = '#0f0';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.blocks[r][c]) {
                    ctx.fillRect(
                        this.x + c * this.blockSize,
                        this.y + r * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }
}

function createShields(canvasWidth, shieldY) {
    const count = 4;
    const shieldW = 22 * 3; // cols * blockSize
    const totalW = count * shieldW;
    const gap = (canvasWidth - totalW) / (count + 1);
    const shields = [];
    for (let i = 0; i < count; i++) {
        shields.push(new Shield(gap + i * (shieldW + gap), shieldY));
    }
    return shields;
}
