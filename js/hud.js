const HUD = {
    draw(ctx, score, lives, canvasWidth, level) {
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

    drawGameOver(ctx, score, canvasWidth, canvasHeight) {
        const scores = HighScores.load();
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
            ctx.fillText((i + 1) + '. ' + scores[i], canvasWidth / 2, canvasHeight / 2 + 5 + i * 22);
        }

        ctx.font = '20px monospace';
        ctx.fillText('Press ENTER to restart', canvasWidth / 2, canvasHeight / 2 + 135);
    },

    drawPaused(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2 - 10);

        ctx.font = '20px monospace';
        ctx.fillText('Press P to resume', canvasWidth / 2, canvasHeight / 2 + 30);
    },

    drawWin(ctx, score, canvasWidth, canvasHeight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#0f0';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALL LEVELS COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 40);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('Final Score: ' + score, canvasWidth / 2, canvasHeight / 2 + 10);
        ctx.fillText('Press ENTER to restart', canvasWidth / 2, canvasHeight / 2 + 50);
    },

    drawLevelComplete(ctx, level, canvasWidth, canvasHeight) {
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
};
