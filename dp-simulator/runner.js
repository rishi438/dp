import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assembleSource } from './src/data/runnerContract.js';
import { runTrace } from './src/data/practice.js';

const MAX_OUTPUT = 65536;
const environment = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'PATHEXT', 'USERPROFILE', 'HOME', 'RUSTUP_HOME', 'CARGO_HOME'].filter(key => process.env[key]).map(key => [key, process.env[key]]));

export function runProcess(command, args, { timeout = 8000, cwd, signal } = {}) {
  return new Promise(resolve => {
    const start = Date.now();
    let stdout = '', stderr = '', bytes = 0, reason = '', finished = false;
    const child = spawn(command, args, { cwd, env: environment, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    const stop = message => {
      if (reason || finished) return;
      reason = message;
      if (process.platform === 'win32' && child.pid) {
        const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        killer.on('error', () => child.kill('SIGKILL'));
        killer.on('close', code => { if (code !== 0 && !finished) child.kill('SIGKILL'); });
      } else if (child.pid) {
        try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
      }
    };
    const abort = () => stop('Execution cancelled.');
    const timer = setTimeout(() => stop(`Execution exceeded ${timeout / 1000} seconds.`), timeout);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const finish = exitCode => {
      if (finished) return;
      finished = true; clearTimeout(timer); signal?.removeEventListener('abort', abort);
      resolve({ success: exitCode === 0 && !reason, stdout, stderr: [stderr, reason].filter(Boolean).join('\n'), exitCode, timeMs: Date.now() - start });
    };
    for (const [stream, isError] of [[child.stdout, false], [child.stderr, true]]) stream.on('data', data => {
      const remaining = Math.max(0, MAX_OUTPUT - bytes); bytes += data.length;
      const text = data.subarray(0, remaining).toString();
      if (isError) stderr += text; else stdout += text;
      if (bytes > MAX_OUTPUT) stop('Output limit exceeded (64 KB).');
    });
    child.on('error', error => { reason = error.code === 'ENOENT' ? `${command} is not installed or is not on PATH.` : `Could not start ${command}.`; finish(-1); });
    child.on('close', code => finish(code ?? -1));
  });
}

export function gradeResults(problem, processResult) {
  const lines = processResult.stdout.split(/\r?\n/).filter(line => line.startsWith('__DP_RESULT__'));
  const results = problem.examples.map((input, i) => {
    const expected = runTrace(problem, input, { maxCalls: 100000 }).result;
    let record;
    try { record = JSON.parse(lines[i]?.slice('__DP_RESULT__'.length) || '{}'); }
    catch { record = { error: 'The runner returned an invalid result.' }; }
    const actual = record.actual;
    const passed = !record.error && typeof actual === typeof expected && (typeof expected === 'number' ? Number.isFinite(actual) && Math.abs(actual - expected) <= 1e-8 : actual === expected);
    return { input, expected, actual: actual ?? null, passed, error: record.error || (!('actual' in record) ? 'No result returned.' : '') };
  });
  const passed = processResult.success && lines.length === problem.examples.length && results.every(result => result.passed);
  return { ...processResult, passed, results, stdout: processResult.stdout.split(/\r?\n/).filter(line => !line.startsWith('__DP_RESULT__')).join('\n').trim() };
}

export async function executeSolution(problem, language, body, signal) {
  const source = assembleSource(problem, language, body);
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'dp-practice-'));
  try {
    const sourcePath = path.join(tempDir, language === 'python' ? 'solution.py' : 'solution.rs');
    await writeFile(sourcePath, source, 'utf8');
    if (language === 'rust') {
      const executable = path.join(tempDir, process.platform === 'win32' ? 'solution.exe' : 'solution');
      const compilation = await runProcess('rustc', ['--edition=2021', sourcePath, '-o', executable], { timeout: 20000, cwd: tempDir, signal });
      if (!compilation.success) return { ...compilation, passed: false, stage: 'compilation', results: [] };
      return gradeResults(problem, await runProcess(executable, [], { cwd: tempDir, signal }));
    }
    return gradeResults(problem, await runProcess('python', ['-I', '-u', sourcePath], { cwd: tempDir, signal }));
  } finally {
    // This unique directory contains only this request's generated source/binary.
    await rm(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

// Tests are read from JSON by the harness, never spliced into Python source.
const SNIPPET_HARNESS = `import json, runpy
with open('tests.json', encoding='utf-8') as f:
    tests = json.load(f)
ns = runpy.run_path('solution.py', run_name='solution')
for t in tests:
    try:
        actual = eval(t['call'], ns)
        expected = eval(t['expected'], ns)
        record = {'passed': actual == expected, 'actual': repr(actual), 'expected': repr(expected)}
    except Exception as error:
        record = {'passed': False, 'error': f'{type(error).__name__}: {error}'}
    print('__QB_RESULT__' + json.dumps(record), flush=True)
`;

export async function executeSnippet({ code, tests }, signal) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'dp-bank-'));
  try {
    await writeFile(path.join(tempDir, 'solution.py'), code, 'utf8');
    await writeFile(path.join(tempDir, 'tests.json'), JSON.stringify(tests), 'utf8');
    await writeFile(path.join(tempDir, 'harness.py'), SNIPPET_HARNESS, 'utf8');
    const run = await runProcess('python', ['-I', '-u', 'harness.py'], { cwd: tempDir, signal });
    const records = run.stdout.split(/\r?\n/).filter(line => line.startsWith('__QB_RESULT__')).map(line => {
      try { return JSON.parse(line.slice('__QB_RESULT__'.length)); } catch { return { passed: false, error: 'Invalid result line.' }; }
    });
    const results = tests.map((test, i) => ({ call: test.call, expected: records[i]?.expected ?? test.expected, actual: records[i]?.actual ?? null, passed: records[i]?.passed === true, error: records[i]?.error || (records[i] ? '' : 'Not run.') }));
    return { ...run, passed: run.success && results.every(result => result.passed), results, stdout: run.stdout.split(/\r?\n/).filter(line => !line.startsWith('__QB_RESULT__')).join('\n').trim() };
  } finally {
    await rm(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
