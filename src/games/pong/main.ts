(function () {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    const WIN_SCORE = 11;
    const PADDLE_W = 14;
    const PADDLE_H = 100;
    const PADDLE_SPEED = 480;
    const AI_SPEED = 360;
    const BALL_SIZE = 14;
    const BALL_SPEED = 380;

    type PongStateName = 'enterName' | 'playing' | 'paused' | 'gameOver';

    interface PongState {
        state: PongStateName;
        playerName: string;
        playerScore: number;
        aiScore: number;
        won: boolean;
        scoreSaved: boolean;
    }

    class Paddle {
        x: number;
        y: number;
        constructor(x: number) {
            this.x = x;
            this.y = (H - PADDLE_H) / 2;
        }
        clamp(): void {
            this.y = Math.max(0, Math.min(H - PADDLE_H, this.y));
        }
        get rect(): { x: number; y: number; w: number; h: number } {
            return { x: this.x, y: this.y, w: PADDLE_W, h: PADDLE_H };
        }
        draw(): void {
            ctx.fillStyle = '#e7ecff';
            ctx.fillRect(this.x, this.y, PADDLE_W, PADDLE_H);
        }
    }

    class Ball {
        x = 0;
        y = 0;
        vx = 0;
        vy = 0;
        constructor() {
            this.reset(Math.random() < 0.5 ? -1 : 1);
        }
        reset(dir: number): void {
            this.x = W / 2 - BALL_SIZE / 2;
            this.y = H / 2 - BALL_SIZE / 2;
            const angle = (Math.random() * 0.6 - 0.3); // -0.3..0.3 rad
            this.vx = dir * BALL_SPEED * Math.cos(angle);
            this.vy = BALL_SPEED * Math.sin(angle);
        }
        get rect(): { x: number; y: number; w: number; h: number } {
            return { x: this.x, y: this.y, w: BALL_SIZE, h: BALL_SIZE };
        }
        draw(): void {
            ctx.fillStyle = '#4db8ff';
            ctx.fillRect(this.x, this.y, BALL_SIZE, BALL_SIZE);
        }
    }

    function overlaps(
        a: { x: number; y: number; w: number; h: number },
        b: { x: number; y: number; w: number; h: number }
    ): boolean {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    const keys: Record<string, boolean> = {};
    let game!: PongState;
    let leftPaddle!: Paddle;
    let rightPaddle!: Paddle;
    let ball!: Ball;
    let lastTime = 0;

    function initEnterName(): void {
        game = {
            state: 'enterName',
            playerName: '',
            playerScore: 0,
            aiScore: 0,
            won: false,
            scoreSaved: false,
        };
        HighScores.refresh().then(draw);
    }

    function startGame(): void {
        leftPaddle = new Paddle(30);
        rightPaddle = new Paddle(W - 30 - PADDLE_W);
        ball = new Ball();
        game.state = 'playing';
        game.playerScore = 0;
        game.aiScore = 0;
        game.won = false;
        game.scoreSaved = false;
        lastTime = performance.now();
    }

    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (
            ['ArrowUp', 'ArrowDown', 'Space'].includes(e.code) ||
            (game && game.state === 'enterName')
        ) {
            e.preventDefault();
        }

        if (e.code === 'KeyP') {
            if (game.state === 'playing') {
                game.state = 'paused';
            } else if (game.state === 'paused') {
                game.state = 'playing';
                lastTime = performance.now();
            }
        }

        if (e.code === 'Escape' && game.state !== 'enterName') {
            initEnterName();
            return;
        }

        if (game.state === 'enterName') {
            if (e.code === 'Backspace') {
                game.playerName = game.playerName.slice(0, -1);
            } else if (e.code === 'Enter' && game.playerName.length > 0) {
                startGame();
            } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key) && game.playerName.length < 10) {
                game.playerName += e.key.toUpperCase();
            }
        } else if (game.state === 'gameOver' && e.code === 'Enter') {
            initEnterName();
        }
    });

    window.addEventListener('keyup', e => {
        keys[e.code] = false;
    });

    function update(dt: number): void {
        if (keys['ArrowUp'] || keys['KeyW']) leftPaddle.y -= PADDLE_SPEED * dt;
        if (keys['ArrowDown'] || keys['KeyS']) leftPaddle.y += PADDLE_SPEED * dt;
        leftPaddle.clamp();

        // Simple AI: track the ball with a capped speed.
        const target = ball.y + BALL_SIZE / 2 - PADDLE_H / 2;
        if (rightPaddle.y < target - 6) rightPaddle.y += AI_SPEED * dt;
        else if (rightPaddle.y > target + 6) rightPaddle.y -= AI_SPEED * dt;
        rightPaddle.clamp();

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Top/bottom walls
        if (ball.y <= 0) {
            ball.y = 0;
            ball.vy = Math.abs(ball.vy);
        } else if (ball.y + BALL_SIZE >= H) {
            ball.y = H - BALL_SIZE;
            ball.vy = -Math.abs(ball.vy);
        }

        // Paddle bounces — deflect based on hit position
        if (ball.vx < 0 && overlaps(ball.rect, leftPaddle.rect)) {
            ball.x = leftPaddle.x + PADDLE_W;
            deflect(leftPaddle, 1);
        } else if (ball.vx > 0 && overlaps(ball.rect, rightPaddle.rect)) {
            ball.x = rightPaddle.x - BALL_SIZE;
            deflect(rightPaddle, -1);
        }

        // Scoring
        if (ball.x + BALL_SIZE < 0) {
            game.aiScore++;
            endOrServe(1);
        } else if (ball.x > W) {
            game.playerScore++;
            endOrServe(-1);
        }
    }

    function deflect(paddle: Paddle, dir: number): void {
        const rel = (ball.y + BALL_SIZE / 2 - (paddle.y + PADDLE_H / 2)) / (PADDLE_H / 2);
        const angle = rel * 1.0; // up to ~1 rad
        const speed = Math.min(BALL_SPEED * 1.6, Math.hypot(ball.vx, ball.vy) * 1.05);
        ball.vx = dir * speed * Math.cos(angle);
        ball.vy = speed * Math.sin(angle);
    }

    function endOrServe(dir: number): void {
        if (game.playerScore >= WIN_SCORE || game.aiScore >= WIN_SCORE) {
            game.won = game.playerScore > game.aiScore;
            game.state = 'gameOver';
        } else {
            ball.reset(dir);
        }
    }

    function drawNet(): void {
        ctx.fillStyle = '#27304f';
        for (let y = 0; y < H; y += 28) {
            ctx.fillRect(W / 2 - 2, y, 4, 16);
        }
    }

    function drawScores(): void {
        ctx.fillStyle = '#e7ecff';
        ctx.font = '48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(game.playerScore), W / 2 - 80, 64);
        ctx.fillText(String(game.aiScore), W / 2 + 80, 64);
        ctx.font = '14px "Courier New", monospace';
        ctx.fillStyle = '#8a93b8';
        ctx.fillText('YOU', W / 2 - 80, 88);
        ctx.fillText('CPU', W / 2 + 80, 88);
    }

    function drawLeaderboard(topY: number): void {
        const scores = HighScores.getCached();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#4db8ff';
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText('— HIGH SCORES —', W / 2, topY);
        ctx.font = '16px "Courier New", monospace';
        ctx.fillStyle = '#97a0c4';
        if (scores.length === 0) {
            ctx.fillText('no scores yet', W / 2, topY + 28);
            return;
        }
        scores.slice(0, 5).forEach((s, i) => {
            ctx.fillText(`${i + 1}. ${s.name}  ${s.score}`, W / 2, topY + 28 + i * 24);
        });
    }

    function drawEnterName(): void {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#4db8ff';
        ctx.font = '56px "Courier New", monospace';
        ctx.fillText('PONG', W / 2, 140);

        ctx.fillStyle = '#e7ecff';
        ctx.font = '20px "Courier New", monospace';
        ctx.fillText('ENTER YOUR NAME', W / 2, 220);
        ctx.font = '36px "Courier New", monospace';
        ctx.fillText(game.playerName + (Math.floor(Date.now() / 400) % 2 ? '_' : ' '), W / 2, 270);

        ctx.fillStyle = '#8a93b8';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('W/S or ↑/↓ to move · first to 11 wins · press ENTER', W / 2, 320);

        drawLeaderboard(380);
    }

    function drawGameOver(): void {
        ctx.fillStyle = 'rgba(5, 6, 13, 0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = game.won ? '#37ff8b' : '#ff5d6c';
        ctx.font = '52px "Courier New", monospace';
        ctx.fillText(game.won ? 'YOU WIN!' : 'YOU LOSE', W / 2, 200);
        ctx.fillStyle = '#e7ecff';
        ctx.font = '22px "Courier New", monospace';
        ctx.fillText(`${game.playerScore} — ${game.aiScore}`, W / 2, 244);
        ctx.fillStyle = '#8a93b8';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('press ENTER to play again', W / 2, 290);
        drawLeaderboard(340);
    }

    function draw(): void {
        ctx.fillStyle = '#05060d';
        ctx.fillRect(0, 0, W, H);

        if (game.state === 'enterName') {
            drawEnterName();
            return;
        }

        drawNet();
        drawScores();
        leftPaddle.draw();
        rightPaddle.draw();
        ball.draw();

        if (game.state === 'paused') {
            ctx.fillStyle = 'rgba(5, 6, 13, 0.6)';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e7ecff';
            ctx.font = '40px "Courier New", monospace';
            ctx.fillText('PAUSED', W / 2, H / 2);
        } else if (game.state === 'gameOver') {
            drawGameOver();
        }
    }

    function loop(now: number): void {
        if (game.state === 'playing') {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            update(dt);
        } else {
            lastTime = now;
        }

        if (game.state === 'gameOver' && !game.scoreSaved) {
            HighScores.add(game.playerName, game.playerScore).then(draw);
            game.scoreSaved = true;
        }

        draw();
        requestAnimationFrame(loop);
    }

    HighScores.configure('pong');
    initEnterName();
    requestAnimationFrame(loop);
})();
