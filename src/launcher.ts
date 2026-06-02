interface GameInfo {
    id: string;
    title: string;
    description: string;
    icon: string;
    accent: string;
}

(function () {
    const GAMES: GameInfo[] = [
        {
            id: 'alien-invaders',
            title: 'Alien Invaders',
            description: 'Defend Earth from waves of descending aliens. Dodge fire, hold the line.',
            icon: '👾',
            accent: '#37ff8b',
        },
        {
            id: 'pong',
            title: 'Pong',
            description: 'The classic paddle duel. Beat the AI to 11 and top the leaderboard.',
            icon: '🏓',
            accent: '#4db8ff',
        },
    ];

    const grid = document.getElementById('gameGrid')!;

    for (const game of GAMES) {
        const card = document.createElement('a');
        card.className = 'game-card';
        card.href = `/games/${game.id}/`;
        card.style.setProperty('--accent', game.accent);

        const icon = document.createElement('div');
        icon.className = 'game-icon';
        icon.textContent = game.icon;

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.textContent = game.title;

        const desc = document.createElement('p');
        desc.className = 'game-desc';
        desc.textContent = game.description;

        const play = document.createElement('span');
        play.className = 'game-play';
        play.textContent = 'Play ▶';

        card.append(icon, title, desc, play);
        grid.appendChild(card);
    }
})();
