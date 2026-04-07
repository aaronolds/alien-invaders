const LEVELS = [
    { speed: 30, shootInterval: 1.5, divebombEnabled: false, divebombRate: 0,   maxDivebombers: 0 },
    { speed: 40, shootInterval: 1.3, divebombEnabled: true,  divebombRate: 4,   maxDivebombers: 1 },
    { speed: 50, shootInterval: 1.1, divebombEnabled: true,  divebombRate: 3,   maxDivebombers: 2 },
    { speed: 60, shootInterval: 0.9, divebombEnabled: true,  divebombRate: 2.5, maxDivebombers: 2 },
    { speed: 75, shootInterval: 0.7, divebombEnabled: true,  divebombRate: 2,   maxDivebombers: 3 },
];

function getLevelConfig(level) {
    if (level < LEVELS.length) return LEVELS[level];
    // Scale beyond defined levels
    const extra = level - LEVELS.length + 1;
    return {
        speed: Math.min(75 + extra * 8, 200),
        shootInterval: Math.max(0.7 - extra * 0.05, 0.25),
        divebombEnabled: true,
        divebombRate: Math.max(2 - extra * 0.15, 0.6),
        maxDivebombers: Math.min(3 + Math.floor(extra / 2), 8),
    };
}
