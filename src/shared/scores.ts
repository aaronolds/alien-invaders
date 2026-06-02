const HighScores = {
    _cache: [] as ScoreEntry[],
    _game: 'default',

    configure(gameId: string): void {
        this._game = gameId;
        this._cache = [];
    },

    refresh(): Promise<ScoreEntry[]> {
        return fetch(`/api/scores?game=${encodeURIComponent(this._game)}`)
            .then(r => r.json())
            .then((scores: ScoreEntry[]) => { this._cache = scores; return scores; })
            .catch(() => this._cache);
    },

    getHighest(): number {
        return this._cache.length > 0 ? this._cache[0].score : 0;
    },

    getCached(): ScoreEntry[] {
        return this._cache;
    },

    add(name: string, score: number): Promise<ScoreEntry[]> {
        return fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: this._game, name, score }),
        })
            .then(r => r.json())
            .then((scores: ScoreEntry[]) => { this._cache = scores; return scores; })
            .catch(() => this._cache);
    },
};
