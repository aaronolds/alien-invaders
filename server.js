const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');
const MAX_SCORES = 10;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
};

function readScores() {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeScores(scores) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

function serveStatic(req, res) {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
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
    // API routes
    if (req.url === '/api/scores' && req.method === 'GET') {
        const scores = readScores();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(scores));
        return;
    }

    if (req.url === '/api/scores' && req.method === 'POST') {
        try {
            const { name, score } = await parseBody(req);
            if (typeof name !== 'string' || typeof score !== 'number') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
                return;
            }
            const scores = readScores();
            const trimmedName = name.slice(0, 10);
            const existing = scores.find(s => s.name === trimmedName);
            if (existing) {
                if (score > existing.score) {
                    existing.score = score;
                }
            } else {
                scores.push({ name: trimmedName, score });
            }
            scores.sort((a, b) => b.score - a.score);
            if (scores.length > MAX_SCORES) scores.length = MAX_SCORES;
            writeScores(scores);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(scores));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad request' }));
        }
        return;
    }

    // Static files
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`Alien Invaders server running at http://localhost:${PORT}`);
});
