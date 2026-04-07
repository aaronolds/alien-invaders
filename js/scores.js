const HighScores = {
    KEY: 'alienInvadersHighScores',
    MAX: 5,

    load() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    save(scores) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(scores));
        } catch (e) { /* ignore */ }
    },

    getHighest() {
        const scores = this.load();
        return scores.length > 0 ? scores[0] : 0;
    },

    isHighScore(score) {
        const scores = this.load();
        return scores.length < this.MAX || score > scores[scores.length - 1];
    },

    add(score) {
        const scores = this.load();
        scores.push(score);
        scores.sort((a, b) => b - a);
        if (scores.length > this.MAX) scores.length = this.MAX;
        this.save(scores);
        return scores;
    },
};
