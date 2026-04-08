type SpriteData = number[][];

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface LevelConfig {
    speed: number;
    shootInterval: number;
    divebombEnabled: boolean;
    divebombRate: number;
    maxDivebombers: number;
    speedBoostPerDrop: number;
}

interface ScoreEntry {
    name: string;
    score: number;
}

type GameStateName = 'enterName' | 'playing' | 'paused' | 'gameOver' | 'won' | 'levelComplete';

interface GameState {
    state: GameStateName;
    playerName: string;
    score: number;
    level: number;
    levelTimer: number;
    scoreSaved: boolean;
}

interface Alien {
    x: number;
    y: number;
    width: number;
    height: number;
    sprite: SpriteData;
    points: number;
    color: string;
    alive: boolean;
    col: number;
    row: number;
    divebombing: boolean;
    divebombPhase: 'descending' | 'returning' | null;
    homeX: number;
    homeY: number;
    divebombTargetX?: number;
}
