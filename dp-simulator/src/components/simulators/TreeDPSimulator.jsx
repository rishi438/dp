import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Trees, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TreeDPSimulator({ input }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1300);
  const [activeLang, setActiveLang] = useState('python');

  // Define binary tree layout:
  //           Node 1 ($3)
  //          /           \
  //     Node 2 ($4)     Node 3 ($5)
  //     /        \             \
  // Node 4 ($1) Node 5 ($3)    Node 6 ($1)
  const defaultNodes = [
    { id: 1, val: 3, x: 250, y: 50, left: 2, right: 3 },
    { id: 2, val: 4, x: 140, y: 150, left: 4, right: 5 },
    { id: 3, val: 5, x: 360, y: 150, left: null, right: 6 },
    { id: 4, val: 1, x: 80, y: 250, left: null, right: null },
    { id: 5, val: 3, x: 200, y: 250, left: null, right: null },
    { id: 6, val: 1, x: 420, y: 250, left: null, right: null }
  ];

  // Post-order processing sequence: 4, 5, 2, 6, 3, 1
  const treeNodes = input ? input.nodes.flatMap((val, i) => {
    if (val < 0) return [];
    const depth = Math.floor(Math.log2(i + 1));
    const offset = i - (2 ** depth - 1);
    const child = j => j < input.nodes.length && input.nodes[j] >= 0 ? j + 1 : null;
    return [{ id: i + 1, val, x: (offset + 0.5) * 500 / (2 ** depth), y: 50 + depth * 100, left: child(i * 2 + 1), right: child(i * 2 + 2) }];
  }) : defaultNodes;
  const postOrderIds = [];
  const visit = id => { const node = treeNodes.find(n => n.id === id); if (!node) return; visit(node.left); visit(node.right); postOrderIds.push(id); };
  visit(1);

  // Precompute step-by-step tree DP states
  const { steps, finalMap } = useMemo(() => {
    const nodeMap = {};
    const stateSnapshot = {};
    const allSteps = [];

    // Initialize node storage
    treeNodes.forEach(n => {
      nodeMap[n.id] = n;
      stateSnapshot[n.id] = { rob: null, skip: null, computed: false };
    });

    postOrderIds.forEach((nodeId, idx) => {
      const node = nodeMap[nodeId];
      const leftState = node.left ? stateSnapshot[node.left] : { rob: 0, skip: 0 };
      const rightState = node.right ? stateSnapshot[node.right] : { rob: 0, skip: 0 };

      const robVal = node.val + (leftState.skip || 0) + (rightState.skip || 0);
      const skipVal = Math.max(leftState.rob || 0, leftState.skip || 0) +
                      Math.max(rightState.rob || 0, rightState.skip || 0);

      stateSnapshot[nodeId] = {
        rob: robVal,
        skip: skipVal,
        computed: true
      };

      allSteps.push({
        stepIdx: idx,
        nodeId,
        nodeVal: node.val,
        robVal,
        skipVal,
        leftId: node.left,
        rightId: node.right,
        line: 5,
        desc: `Visiting Node ${nodeId} ($${node.val}): rob = $${node.val} + ${leftState.skip || 0} + ${rightState.skip || 0} = $${robVal}. skip = max(${leftState.rob || 0}, ${leftState.skip || 0}) + max(${rightState.rob || 0}, ${rightState.skip || 0}) = $${skipVal}.`,
        snapshot: JSON.parse(JSON.stringify(stateSnapshot))
      });
    });

    return { steps: allSteps, finalMap: stateSnapshot };
  }, []);

  const activeStep = steps[currentStepIndex] || steps[0];

  useAutoplay({ playing: isPlaying, step: currentStepIndex, last: steps.length - 1, speed, onStep: setCurrentStepIndex, onStop: setIsPlaying });

  // Which nodes are robbed in the optimal choice?
  // Optimal choices: Root (1): rob = 3 + 4 + 1 = 8? Let's check root:
  // Node 4: rob=1, skip=0
  // Node 5: rob=3, skip=0
  // Node 2: rob = 4 + 0 + 0 = 4, skip = max(1,0)+max(3,0) = 4
  // Node 6: rob=1, skip=0
  // Node 3: rob = 5 + 0 = 5, skip = max(1,0) = 1
  // Node 1: rob = 3 + 4 + 1 = 8; skip = max(4,4) + max(5,1) = 4 + 5 = 9.
  // Best at root is skip (9) -> Rob Node 2 (val 4) or its kids (1+3=4) and Node 3 (val 5) -> Total 9!
  const isFinalStep = currentStepIndex === steps.length - 1;
  const robbedIds = new Set();
  const chooseNodes = (id, blocked = false) => {
    const node = treeNodes.find(n => n.id === id);
    if (!node) return;
    const take = !blocked && finalMap[id].rob >= finalMap[id].skip;
    if (take) robbedIds.add(id);
    chooseNodes(node.left, take); chooseNodes(node.right, take);
  };
  chooseNodes(1);
  const treeHeight = Math.max(...treeNodes.map(node => node.y)) + 70;

  const pythonCode = [
    { num: 1, text: "def rob(root: TreeNode) -> int:" },
    { num: 2, text: "    def dfs(node):" },
    { num: 3, text: "        if not node: return (0, 0)  # (rob, skip)" },
    { num: 4, text: "        left_rob, left_skip = dfs(node.left)" },
    { num: 5, text: "        right_rob, right_skip = dfs(node.right)" },
    { num: 6, text: "        rob_curr = node.val + left_skip + right_skip" },
    { num: 7, text: "        skip_curr = max(left_rob, left_skip) + max(right_rob, right_skip)" },
    { num: 8, text: "        return (rob_curr, skip_curr)" },
    { num: 9, text: "    rob_root, skip_root = dfs(root)" },
    { num: 10, text: "    return max(rob_root, skip_root)" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn rob(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {" },
    { num: 2, text: "    fn dfs(node: &Option<Rc<RefCell<TreeNode>>>) -> (i32, i32) {" },
    { num: 3, text: "        match node {" },
    { num: 4, text: "            None => (0, 0)," },
    { num: 5, text: "            Some(n) => {" },
    { num: 6, text: "                let b = n.borrow();" },
    { num: 7, text: "                let (l_rob, l_skip) = dfs(&b.left);" },
    { num: 8, text: "                let (r_rob, r_skip) = dfs(&b.right);" },
    { num: 9, text: "                let rob = b.val + l_skip + r_skip;" },
    { num: 10, text: "                let skip = l_rob.max(l_skip) + r_rob.max(r_skip);" },
    { num: 11, text: "                (rob, skip)" },
    { num: 12, text: "            }" },
    { num: 13, text: "        }" },
    { num: 14, text: "    }" },
    { num: 15, text: "    let (r, s) = dfs(&root); r.max(s)" },
    { num: 16, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-lime-500/10 border border-lime-500/30 text-lime-400 rounded-xl">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 bg-lime-950 px-2 py-0.5 rounded border border-lime-800">
                Chapter 14 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Root the Elder Tree</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Tree DP · House Robber III (Post-Order DFS Pair)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentStepIndex(p => Math.max(0, p - 1)); setIsPlaying(false); }}
              disabled={currentStepIndex === 0}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"
              title="Step Backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-md shadow-lime-900/40"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => { setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1)); setIsPlaying(false); }}
              disabled={currentStepIndex === steps.length - 1}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"
              title="Step Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono"
          >
            <option value={2000}>0.5x Slow</option>
            <option value={1300}>1.0x Normal</option>
            <option value={600}>2.0x Fast</option>
          </select>
        </div>
      </div>

      {/* Main Dual Grid: SVG Tree Visualization vs Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: SVG Tree & Node State Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-2 text-slate-400">
              <span className="font-semibold text-slate-300">Binary Tree Post-Order Hierarchy (Leaves First)</span>
              <span className="font-mono text-lime-400">Step {currentStepIndex + 1} / {steps.length}</span>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 flex items-center justify-center">
              <svg width="100%" height={treeHeight} viewBox={`0 0 500 ${treeHeight}`} className="overflow-visible">
                {/* Edges */}
                {treeNodes.flatMap(parent => [parent.left, parent.right].filter(Boolean).map(id => {
                  const child = treeNodes.find(n => n.id === id);
                  return <line key={`${parent.id}-${id}`} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke="var(--muted)" strokeWidth="2.5" />;
                }))}

                {/* Nodes */}
                {treeNodes.map(node => {
                  const state = activeStep.snapshot[node.id];
                  const isCurrent = node.id === activeStep.nodeId;
                  const isChildDep = node.id === activeStep.leftId || node.id === activeStep.rightId;
                  const isGoldRobbed = isFinalStep && robbedIds.has(node.id);

                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      {/* Glow ring */}
                      {isCurrent && (
                        <circle r="32" fill="none" stroke="#84cc16" strokeWidth="3" opacity="0.6" className="animate-pulse" />
                      )}

                      {/* Main circle */}
                      <circle
                        r="25"
                        fill={isGoldRobbed ? '#854d0e' : isCurrent ? '#3f6212' : isChildDep ? '#0e7490' : state.computed ? '#1e293b' : '#0f172a'}
                        stroke={isGoldRobbed ? '#eab308' : isCurrent ? '#84cc16' : isChildDep ? '#06b6d4' : state.computed ? '#475569' : '#334155'}
                        strokeWidth={isCurrent || isGoldRobbed ? '2.5' : '1.5'}
                      />

                      {/* Node Val */}
                      <text
                        textAnchor="middle"
                        dy="-4"
                        fill={isGoldRobbed ? '#fef08a' : '#ffffff'}
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ${node.val}
                      </text>

                      {/* Node ID */}
                      <text
                        textAnchor="middle"
                        dy="12"
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="600"
                      >
                        N{node.id}
                      </text>

                      {/* State Badge below node */}
                      <foreignObject x="-45" y="30" width="90" height="35">
                        <div className={`text-[9px] font-mono text-center px-1 py-0.5 rounded border transition-all ${
                          state.computed
                            ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                            : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
                        }`}>
                          {state.computed ? (
                            <div>
                              <span className="text-lime-400 font-bold">R:${state.rob}</span> | <span className="text-cyan-400 font-bold">S:${state.skip}</span>
                            </div>
                          ) : (
                            <span>pending...</span>
                          )}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Explanation of current node math */}
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-semibold text-white">{activeStep.desc}</div>
            </div>

            {/* Final outcome banner */}
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Max Loot Formula</div>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                  max(rob(root), skip(root))
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Max Plunder</div>
                <div className="text-base font-extrabold text-lime-400 font-mono">
                  {isFinalStep ? '$9 Loot (Nodes 2 & 3)' : 'Computing...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Code Viewer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Synchronized Algorithm</span>
            </div>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveLang('python')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeLang === 'python' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveLang('rust')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeLang === 'rust' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rust
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950/90 font-mono text-[11px] leading-relaxed flex-1 overflow-x-auto">
            {(activeLang === 'python' ? pythonCode : rustCode).map((line) => {
              const isHighlight = line.num === activeStep.line;
              return (
                <div
                  key={line.num}
                  className={`flex items-center px-2 py-0.5 rounded transition-all ${
                    isHighlight
                      ? 'bg-lime-500/20 text-lime-200 border-l-2 border-lime-400 font-bold'
                      : 'text-slate-400 hover:bg-slate-900/50'
                  }`}
                >
                  <span className="w-6 text-slate-600 select-none text-right mr-3 text-[10px]">
                    {line.num}
                  </span>
                  <pre className="font-mono whitespace-pre">{line.text}</pre>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Time: <span className="text-lime-400 font-bold">O(N) DFS</span></span>
              <span>Space: <span className="text-lime-400 font-bold">O(Height) Stack</span></span>
              <span>State: <span className="text-cyan-400 font-bold">Pair [rob, skip]</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
