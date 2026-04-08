class Shield {
    x: number;
    y: number;
    blockSize: number;
    cols: number;
    rows: number;
    width: number;
    height: number;
    blocks: boolean[][];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.blockSize = 3;
        this.cols = 22;
        this.rows = 16;
        this.width = this.cols * this.blockSize;
        this.height = this.rows * this.blockSize;
        this.blocks = this._initBlocks();
    }

    _initBlocks(): boolean[][] {
        // Classic arch shape
        const grid: boolean[][] = [];
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

    hitTest(rect: Rect): boolean {
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

    hitTestBlast(rect: Rect, radius: number): boolean {
        const bx1 = Math.floor((rect.x - this.x) / this.blockSize);
        const by1 = Math.floor((rect.y - this.y) / this.blockSize);
        const bx2 = Math.floor((rect.x + rect.w - 1 - this.x) / this.blockSize);
        const by2 = Math.floor((rect.y + rect.h - 1 - this.y) / this.blockSize);

        // First check if bullet touches any block
        let hit = false;
        for (let r = Math.max(0, by1); r <= Math.min(this.rows - 1, by2); r++) {
            for (let c = Math.max(0, bx1); c <= Math.min(this.cols - 1, bx2); c++) {
                if (this.blocks[r][c]) { hit = true; break; }
            }
            if (hit) break;
        }
        if (!hit) return false;

        // Destroy blocks within radius of bullet center
        const cx = rect.x + rect.w / 2;
        const cy = rect.y + rect.h / 2;
        const rBlocks = Math.ceil(radius / this.blockSize);
        const centerCol = Math.floor((cx - this.x) / this.blockSize);
        const centerRow = Math.floor((cy - this.y) / this.blockSize);

        for (let r = centerRow - rBlocks; r <= centerRow + rBlocks; r++) {
            for (let c = centerCol - rBlocks; c <= centerCol + rBlocks; c++) {
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
                const blockCx = this.x + (c + 0.5) * this.blockSize;
                const blockCy = this.y + (r + 0.5) * this.blockSize;
                const dx = blockCx - cx;
                const dy = blockCy - cy;
                if (dx * dx + dy * dy <= radius * radius) {
                    this.blocks[r][c] = false;
                }
            }
        }
        return true;
    }

    // Destroy a larger area for alien body collisions
    hitTestArea(rect: Rect): boolean {
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

    draw(ctx: CanvasRenderingContext2D): void {
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

function createShields(canvasWidth: number, shieldY: number): Shield[] {
    const count = 4;
    const shieldW = 22 * 3; // cols * blockSize
    const totalW = count * shieldW;
    const gap = (canvasWidth - totalW) / (count + 1);
    const shields: Shield[] = [];
    for (let i = 0; i < count; i++) {
        shields.push(new Shield(gap + i * (shieldW + gap), shieldY));
    }
    return shields;
}
