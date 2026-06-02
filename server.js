const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const SCORES_FILE = path.join(ROOT, 'scores.json');
const MAX_SCORES = 10;
const GAME_ID_RE = /^[a-z0-9-]+$/;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
};

// Score store is an object keyed by game id: { "<game>": [{name, score}, ...] }.
function readScoreStore() {
    try {
        const raw = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
        if (Array.isArray(raw)) {
            const migrated = { 'alien-invaders': raw };
            writeScoreStore(migrated);
            return migrated; // migrate legacy format
        }
        if (raw && typeof raw === 'object') return raw;
        return {};
    } catch (e) {
        return {};
    }
}

function writeScoreStore(store) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(store, null, 2));
}

function isValidGame(game) {
    return typeof game === 'string' && GAME_ID_RE.test(game);
}

function serveStatic(req, res, pathname) {
    let urlPath;
    try {
        urlPath = decodeURIComponent(pathname);
    } catch (e) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
    }
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    urlPath = urlPath.replace(/^\/+/, '');

    // Resolve within ROOT and reject path traversal.
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(e); }
        });
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // GET /api/scores?game=<id>
    if (pathname === '/api/scores' && req.method === 'GET') {
        const game = url.searchParams.get('game');
        if (!isValidGame(game)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid or missing game id' }));
            return;
        }
        const store = readScoreStore();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(store[game] || []));
        return;
    }

    // POST /api/scores  { game, name, score }
    if (pathname === '/api/scores' && req.method === 'POST') {
        try {
            const { game, name, score } = await parseBody(req);
            if (!isValidGame(game) || typeof name !== 'string' || !Number.isFinite(score)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
                return;
            }
            const store = readScoreStore();
            const scores = store[game] || (store[game] = []);
            const trimmedName = name.slice(0, 10);
            const existing = scores.find(s => s.name === trimmedName);
            if (existing) {
                if (score > existing.score) existing.score = score;
            } else {
                scores.push({ name: trimmedName, score });
            }
            scores.sort((a, b) => b.score - a.score);
            if (scores.length > MAX_SCORES) scores.length = MAX_SCORES;
            writeScoreStore(store);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(scores));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad request' }));
        }
        return;
    }

    // Static files
    serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
    console.log(`Arcade server running at http://localhost:${PORT}`);
});
