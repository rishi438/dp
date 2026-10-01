import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const result = spawnSync(process.execPath, ['--test', 'tests/practice.test.js'], { cwd: fileURLToPath(new URL('.', import.meta.url)), stdio: 'inherit' });
process.exitCode = result.status ?? 1;
