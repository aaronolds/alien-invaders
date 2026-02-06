const HUD = {
    draw(ctx, score, lives, canvasWidth) {
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE: ' + score, 20, 30);

        ctx.textAlign = 'right';
        ctx.fillText('LIVES: ', canvasWidth - 100, 30);

        // Draw small ship icons for lives
        for (let i = 0; i < lives; i++) {
            drawSprite(ctx, SPRITES.player, canvasWidth - 90 + i * 28, 16, 2, '#0f0');
        }
    },

    drawGameOver(ctx, score, canvasWidth, canvasHeight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#f00';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 40);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('Score: ' + score, canvasWidth / 2, canvasHeight / 2 + 10);
        ctx.fillText('Press ENTER to restart', canvasWidth / 2, canvasHeight / 2 + 50);
    },

    drawWin(ctx, score, canvasWidth, canvasHeight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#0f0';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvasWidth / 2, canvasHeight / 2 - 40);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('Score: ' + score, canvasWidth / 2, canvasHeight / 2 + 10);
        ctx.fillText('Press ENTER to restart', canvasWidth / 2, canvasHeight / 2 + 50);
    },
};
