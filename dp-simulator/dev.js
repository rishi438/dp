import { createServer as createViteServer } from 'vite';
import { createServer as createRunner } from './server.js';

const runner = createRunner();
await new Promise((resolve, reject) => { runner.once('error', reject); runner.listen(9000, '127.0.0.1', resolve); });
let vite;
try {
  vite = await createViteServer();
  await vite.listen(); vite.printUrls();
  console.log('Python/Rust runner ready on 127.0.0.1:9000.');
} catch (error) { runner.close(); throw error; }
const shutdown = async () => { await vite.close(); runner.closeAllConnections(); runner.close(); };
process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
