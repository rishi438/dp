import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPractice } from './src/data/practice.js';
import { executeSolution, runProcess } from './runner.js';
import { reviewReasoning, ReviewUnavailable } from './reasoning-review.js';
import { answerErrors } from './src/data/reasoning.js';
import { goldPractice } from './src/data/staircase.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(directory, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const origins = new Set(['http://localhost:4173', 'http://127.0.0.1:4173', 'http://localhost:5173', 'http://127.0.0.1:5173']);

export function createServer({ reviewer = reviewReasoning } = {}) {
  let active = false;
  let reviewing = false;
  const json = (res, code, value) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const host = req.headers.host;
    if (!host || !/^(localhost|127\.0\.0\.1):\d+$/.test(host)) return json(res, 403, { error: 'Local requests only.' });
    const url = new URL(req.url, `http://${host}`);
    if (req.headers.origin && !origins.has(req.headers.origin)) return json(res, 403, { error: 'Origin is not allowed.' });
    if (url.pathname === '/api/reasoning/review' && req.method === 'POST') {
      if (!origins.has(req.headers.origin)) return json(res, 403, { error: 'Check reasoning from the local simulator.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Expected JSON.' });
      if (reviewing) return json(res, 429, { error: 'Another reasoning check is running. Try again when it finishes.' });
      reviewing = true;
      const controller = new AbortController();
      res.on('close', () => { if (!res.writableEnded) controller.abort(); });
      try {
        const chunks = []; let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 65536) return json(res, 413, { error: 'Reasoning is too long (64 KB maximum).' });
          chunks.push(chunk);
        }
        let data;
        try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return json(res, 400, { error: 'Invalid JSON.' }); }
        const problem = data?.problemId === goldPractice.id ? goldPractice : getPractice(data?.problemId);
        if (!problem) return json(res, 400, { error: 'Choose a valid exercise.' });
        const fields = answerErrors(data.answers);
        if (Object.keys(fields).length) return json(res, 400, { error: 'Complete all five answers before checking.', fields });
        const review = await reviewer(problem, data.answers, controller.signal);
        if (!res.destroyed) json(res, 200, { review });
      } catch (error) {
        if (!res.destroyed) json(res, 503, { error: error instanceof ReviewUnavailable ? error.message : 'The reasoning check could not finish. Your answers are saved; please retry.' });
      } finally { reviewing = false; }
      return;
    }
    if (url.pathname === '/api/health' && req.method === 'GET') {
      const versions = await Promise.all(['python', 'rustc'].map(command => runProcess(command, ['--version'], { timeout: 3000 })));
      return json(res, 200, { python: versions[0].success ? versions[0].stdout.trim() : null, rust: versions[1].success ? versions[1].stdout.trim() : null });
    }
    if (url.pathname === '/api/run' && req.method === 'POST') {
      if (!origins.has(req.headers.origin)) return json(res, 403, { error: 'Run solutions from the local simulator.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Expected JSON.' });
      if (active) return json(res, 429, { error: 'A solution is already running. Wait for it to finish.' });
      active = true;
      const controller = new AbortController();
      res.on('close', () => { if (!res.writableEnded) controller.abort(); });
      try {
        let bytes = 0, body = '';
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 65536) { json(res, 413, { error: 'Request too large (64 KB maximum).' }); return; }
          body += chunk;
        }
        let data;
        try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON.' }); }
        const problem = getPractice(data?.problemId);
        if (!problem || !['python', 'rust'].includes(data?.language) || typeof data?.body !== 'string' || data.body.length > 40000) return json(res, 400, { error: 'Choose a valid exercise, language and solution body.' });
        const result = await executeSolution(problem, data.language, data.body, controller.signal);
        if (!res.destroyed) json(res, 200, result);
      } catch (error) {
        if (!res.destroyed) json(res, 500, { error: 'The runner could not complete this request. Check the local terminal.' });
        console.error('runner_failed', error.message);
      } finally { active = false; }
      return;
    }
    if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Unknown API route.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed.' });
    try {
      const requested = decodeURIComponent(url.pathname);
      const filename = path.resolve(dist, `.${requested === '/' ? '/index.html' : requested}`);
      const relative = path.relative(dist, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) return json(res, 403, { error: 'Invalid path.' });
      let content;
      try { content = await readFile(filename); }
      catch (error) { if (error.code !== 'ENOENT' || path.extname(filename)) throw error; content = await readFile(path.join(dist, 'index.html')); }
      res.writeHead(200, {
        'Content-Type': mime[path.extname(filename)] || 'text/html; charset=utf-8',
        'Cache-Control': !path.extname(filename) || path.extname(filename) === '.html' ? 'no-cache, must-revalidate' : 'public, max-age=31536000, immutable',
      });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch { json(res, 404, { error: 'File not found. Run npm run build before npm start.' }); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createServer();
  server.listen(4173, '127.0.0.1', () => console.log('DP simulator and local code runner: http://127.0.0.1:4173'));
  server.on('error', error => { console.error(`Server failed: ${error.message}`); process.exitCode = 1; });
}
