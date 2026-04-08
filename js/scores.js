const HighScores = {
    _cache: [],

    refresh() {
        return fetch('/api/scores')
            .then(r => r.json())
            .then(scores => { this._cache = scores; return scores; })
            .catch(() => this._cache);
    },

    getHighest() {
        return this._cache.length > 0 ? this._cache[0].score : 0;
    },

    getCached() {
        return this._cache;
    },

    add(name, score) {
        return fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score }),
        })
            .then(r => r.json())
            .then(scores => { this._cache = scores; return scores; })
            .catch(() => this._cache);
    },
};
