// Executable Python equivalents of the reference recurrences in practice.js.
// Code markers also drive the intermediate steps between state events.
const definitions = {
  'gold-stairs': ['i', 'nums[0] if i == 0 else nums[i] + max(go(i - 1), go(i - 2) if i > 1 else -float("inf"))', 'max(go(i) for i in range(len(nums))) if nums else 0'],
  stairs: ['i', '1 if i == 0 else sum(go(i - h) for h in hops if h <= i)', 'go(n)'],
  fib: ['i', 'i if i < 2 else go(i - 1) + go(i - 2)', 'go(n)'],
  'coin-min': ['x', '0 if x == 0 else min([float("inf")] + [1 + go(x - c) for c in coins if c <= x])', 'answer if answer != float("inf") else -1', [], ['answer = go(amount)']],
  'coin-combinations': ['i, x', '1 if x == 0 else 0 if i == len(coins) else go(i + 1, x) + (go(i, x - coins[i]) if x >= coins[i] else 0)', 'go(0, amount)'],
  'word-break': ['i', 'i == len(s) or any([go(i + len(w)) for w in words if s.startswith(w, i)])', 'go(0)'],
  kadane: ['i', 'nums[0] if i == 0 else max(nums[i], nums[i] + go(i - 1))', 'max(go(i) for i in range(len(nums))) if nums else 0'],
  lcs: ['i, j', '0 if not i or not j else 1 + go(i - 1, j - 1) if s1[i - 1] == s2[j - 1] else max(go(i - 1, j), go(i, j - 1))', 'go(len(s1), len(s2))'],
  'edit-distance': ['i, j', 'j if not i else i if not j else go(i - 1, j - 1) if s1[i - 1] == s2[j - 1] else 1 + min(go(i - 1, j), go(i, j - 1), go(i - 1, j - 1))', 'go(len(s1), len(s2))'],
  'grid-min': ['r, c', 'grid[0][0] if r == c == 0 else grid[r][c] + min(go(r - 1, c) if r else float("inf"), go(r, c - 1) if c else float("inf"))', 'go(len(grid) - 1, len(grid[0]) - 1)'],
  'grid-paths': ['r, c', '1 if not r or not c else go(r - 1, c) + go(r, c - 1)', 'go(rows - 1, cols - 1)'],
  knapsack: ['i, w', '0 if not i else max(go(i - 1, w), values[i - 1] + go(i - 1, w - weights[i - 1]) if w >= weights[i - 1] else -float("inf"))', 'go(len(weights), capacity)'],
  'subset-sum': ['i, x', 'True if x == 0 else False if not i else bool(go(i - 1, x) | (x >= nums[i - 1] and go(i - 1, x - nums[i - 1])))', 'go(len(nums), target)'],
  lis: ['i', '1 + max([0] + [go(j) for j in range(i) if nums[j] < nums[i]])', 'max([0] + [go(i) for i in range(len(nums))])'],
  'stock-cooldown': ['i, hold', '(-float("inf") if hold else 0) if i >= len(prices) else max(go(i + 1, 1), prices[i] + go(i + 2, 0)) if hold else max(go(i + 1, 0), -prices[i] + go(i + 1, 1))', 'go(0, 0)'],
  'matrix-chain': ['l, r', '0 if l == r else min(go(l, k) + go(k + 1, r) + dims[l] * dims[k + 1] * dims[r + 1] for k in range(l, r))', 'go(0, len(dims) - 2)'],
  'burst-balloons': ['l, r', '0 if r == l + 1 else max(go(l, k) + go(k, r) + b[l] * b[k] * b[r] for k in range(l + 1, r))', 'go(0, len(b) - 1)', ['b = [1] + nums + [1]']],
  lps: ['l, r', '0 if l > r else 1 if l == r else 2 + go(l + 1, r - 1) if s[l] == s[r] else max(go(l + 1, r), go(l, r - 1))', 'go(0, len(s) - 1)'],
  'tree-rob': ['i, blocked', '0 if i >= len(nodes) or nodes[i] < 0 else max(go(2 * i + 1, 0) + go(2 * i + 2, 0), -float("inf") if blocked else nodes[i] + go(2 * i + 1, 1) + go(2 * i + 2, 1))', 'go(0, 0)'],
  tsp: ['mask, last', 'dist[last][0] if mask == (1 << n) - 1 else min([float("inf")] + [dist[last][city] + go(mask | (1 << city), city) for city in range(n) if not mask & (1 << city)])', '0 if n == 1 else go(1, 0)', ['n = len(dist)']],
  'digit-no4': ['pos, tight', '1 if pos == len(d) else sum(go(pos + 1, int(tight and x == d[pos])) for x in range((d[pos] if tight else 9) + 1) if x != 4)', '0 if n < 0 else go(0, 1)', ['d = [int(x) for x in str(max(0, n))]']],
  'digit-adjacent': ['pos, prev, tight, started', '1 if pos == len(d) else sum(go(pos + 1, x, int(tight and x == d[pos]), int(started or x != 0)) for x in range((d[pos] if tight else 9) + 1) if not (started and prev == x))', '0 if n < 0 else go(0, -1, 1, 0)', ['d = [int(x) for x in str(max(0, n))]']],
  knight: ['k, r, c', '0 if r < 0 or c < 0 or r >= size or c >= size else 1 if k == 0 else sum(go(k - 1, r + dr, c + dc) / 8 for dr, dc in jumps)', 'go(moves, row, col)', ['jumps = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]']],
  'jump-k': ['i', 'nums[0] if i == 0 else nums[i] + max(go(i - offset) for offset in range(1, min(i, k) + 1))', 'go(len(nums) - 1) if nums else 0'],
};

export function traceCode(problem, memoized = true) {
  const key = problem.id.startsWith('stairs-') ? 'stairs' : problem.id.startsWith('fib-') ? 'fib' : problem.id;
  const [params, expression, answer, setup = [], finish = []] = definitions[key];
  const lines = [], markers = {};
  const add = (text, kind) => { lines.push(text); if (kind) markers[kind] = lines.length; };
  add(`def solve(${problem.args.map(a => a.name).join(', ')}):`, 'solve');
  const setupLines = [];
  setup.forEach(text => { add(`    ${text}`); setupLines.push(lines.length); });
  if (memoized) add('    memo = {}', 'init');
  add(`    def go(${params}):`, 'call');
  if (memoized) {
    add(`        key = (${params},)`, 'key');
    add('        if key in memo:', 'lookup');
    add('            return memo[key]', 'cache');
  }
  add('        value = (', 'enter');
  add(`            ${expression}`, 'evaluate');
  add('        )');
  if (memoized) add('        memo[key] = value', 'store');
  add('        return value', 'return');
  finish.forEach(text => add(`    ${text}`, 'finish'));
  add(`    return ${answer}`, 'answer');
  return { lines, markers, setupLines, params: params.split(', '), source: lines.join('\n') };
}

// Expand the bounded reference trace without changing its calls or answers.
// Expressions can suspend multiple times: explicitly visit the caller again
// after each child returns, before starting the next child.
export function codeStepTrace(problem, trace, memoized = true) {
  const { markers, setupLines } = traceCode(problem, memoized);
  const events = [];
  const outer = { state: [], key: '' };
  const push = (event, kind, line, message, extra = {}) => events.push({ ...event, kind, line, message, ...extra });
  push(outer, 'solve', markers.solve, 'Call solve with the current input.');
  setupLines.forEach(line => push(outer, 'setup', line, 'Prepare the input used by go.'));
  if (memoized) push(outer, 'init', markers.init, 'Create the empty memo dictionary.');
  push(outer, 'define', markers.call, 'Define go; its body runs only when called.');
  const driverLine = markers.finish || markers.answer;
  push(outer, 'invoke', driverLine, 'Start evaluating the outer expression and call go if needed.');
  const nodes = new Map(trace.nodes.map(node => [node.id, node]));
  for (const event of trace.events) {
    if (event.kind === 'enter' || event.kind === 'cache') {
      const frame = { id: event.id, key: event.key, state: event.state };
      push(frame, 'call', markers.call, 'Enter go with these arguments.');
      if (memoized) {
        push(frame, 'key', markers.key, 'Build the memo key from the arguments.');
        push(frame, 'lookup', markers.lookup, event.kind === 'cache' ? 'The key is present: take the cached return.' : 'The key is absent: continue to the calculation.');
      }
      if (event.kind === 'enter') {
        push(event, 'enter', markers.enter, 'Start computing value.');
        push(frame, 'evaluate', markers.evaluate, 'Evaluate the base condition, then the selected expression from left to right.');
      }
    }
    if (event.kind === 'return' || event.kind === 'cache') {
      if (memoized && event.kind === 'return') push(event, 'store', markers.store, 'Save the computed value in memo[key].');
      push(event, event.kind, markers[event.kind], event.kind === 'cache' ? 'Return memo[key] without computing this state again.' : 'Return value to the caller.');
      const parent = nodes.get(nodes.get(event.id)?.parent);
      const caller = parent ? { id: parent.id, key: parent.key, state: parent.state } : outer;
      push(caller, 'resume', parent ? markers.evaluate : driverLine, 'Resume the caller where this child returned; continue evaluating the expression.', { returnedValue: event.value, returnedKey: event.key });
    }
    if (event.kind === 'answer') push(event, 'answer', markers.answer, 'Return the final result from solve.');
  }
  return { ...trace, events };
}
