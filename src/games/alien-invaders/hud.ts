const HUD = {
    draw(ctx: CanvasRenderingContext2D, score: number, lives: number, canvasWidth: number, level: number): void {
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE: ' + score, 20, 30);

        ctx.textAlign = 'center';
        ctx.fillText('LEVEL ' + (level + 1), canvasWidth / 2, 30);

        ctx.font = '14px monospace';
        ctx.fillText('HI: ' + HighScores.getHighest(), canvasWidth / 2, 48);

        ctx.font = '20px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('LIVES: ', canvasWidth - 100, 30);

        // Draw small ship icons for lives
        for (let i = 0; i < lives; i++) {
            drawSprite(ctx, SPRITES.player, canvasWidth - 90 + i * 28, 16, 2, '#0f0');
        }
    },

    drawGameOver(ctx: CanvasRenderingContext2D, score: number, canvasWidth: number, canvasHeight: number): void {
        const scores = HighScores.getCached();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#f00';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 100);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('Score: ' + score, canvasWidth / 2, canvasHeight / 2 - 55);

        // Leaderboard
        ctx.fillStyle = '#ff5';
        ctx.font = '18px monospace';
        ctx.fillText('— HIGH SCORES —', canvasWidth / 2, canvasHeight / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        for (let i = 0; i < scores.length; i++) {
            const name = scores[i].name.padEnd(10);
            ctx.fillText((i + 1) + '. ' + name + ' ' + scores[i].score, canvasWidth / 2, canvasHeight / 2 + 5 + i * 22);
        }

        ctx.font = '20px monospace';
        ctx.fillText('Press ENTER for new player', canvasWidth / 2, canvasHeight / 2 + 135);
    },

    drawPaused(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2 - 10);

        ctx.font = '20px monospace';
        ctx.fillText('Press P to resume', canvasWidth / 2, canvasHeight / 2 + 30);
    },

    drawWin(ctx: CanvasRenderingContext2D, score: number, canvasWidth: number, canvasHeight: number): void {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#0f0';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALL LEVELS COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 40);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('Final Score: ' + score, canvasWidth / 2, canvasHeight / 2 + 10);

        const scores = HighScores.getCached();
        if (scores.length > 0) {
            ctx.fillStyle = '#ff5';
            ctx.font = '18px monospace';
            ctx.fillText('— HIGH SCORES —', canvasWidth / 2, canvasHeight / 2 + 45);
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            for (let i = 0; i < scores.length; i++) {
                const name = scores[i].name.padEnd(10);
                ctx.fillText((i + 1) + '. ' + name + ' ' + scores[i].score, canvasWidth / 2, canvasHeight / 2 + 70 + i * 22);
            }
        }

        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText('Press ENTER for new player', canvasWidth / 2, canvasHeight / 2 + 200);
    },

    drawLevelComplete(ctx: CanvasRenderingContext2D, level: number, canvasWidth: number, canvasHeight: number): void {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#0f0';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL ' + (level + 1) + ' COMPLETE', canvasWidth / 2, canvasHeight / 2 - 20);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('Get Ready...', canvasWidth / 2, canvasHeight / 2 + 25);
    },

    drawEnterName(ctx: CanvasRenderingContext2D, name: string, canvasWidth: number, canvasHeight: number): void {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#0f0';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALIEN INVADERS', canvasWidth / 2, 100);

        ctx.fillStyle = '#ff5';
        ctx.font = '24px monospace';
        ctx.fillText('ENTER YOUR NAME', canvasWidth / 2, 160);

        // Draw name input box
        const boxW = 240;
        const boxH = 40;
        const boxX = canvasWidth / 2 - boxW / 2;
        const boxY = 180;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Blinking cursor
        const cursor = Math.floor(Date.now() / 500) % 2 === 0 ? '_' : '';
        ctx.fillStyle = '#fff';
        ctx.font = '28px monospace';
        ctx.fillText(name + cursor, canvasWidth / 2, boxY + 30);

        ctx.fillStyle = '#888';
        ctx.font = '16px monospace';
        ctx.fillText('Press ENTER to start', canvasWidth / 2, 255);

        // Top 5 high scores
        const scores = HighScores.getCached();
        if (scores.length > 0) {
            ctx.fillStyle = '#ff5';
            ctx.font = '20px monospace';
            ctx.fillText('— TOP SCORES —', canvasWidth / 2, 310);
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            const top5 = scores.slice(0, 5);
            for (let i = 0; i < top5.length; i++) {
                const entry = (i + 1) + '. ' + top5[i].name.padEnd(10) + ' ' + top5[i].score;
                ctx.fillText(entry, canvasWidth / 2, 340 + i * 24);
            }
        }
    },
};
