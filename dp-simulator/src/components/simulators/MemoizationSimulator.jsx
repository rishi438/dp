import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import { CheckCircle2, Zap, BookOpen, Clock, TrendingDown, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

// Custom Node for Chapter 2: Memoization Node (Cache Hit vs Compute vs Base)
function MemoCallNode({ data }) {
  const { val, isCacheHit, isBase, isDuplicate, isMemoActive } = data;

  let borderStyle = 'border-slate-700 bg-slate-900 text-slate-200';
  let badge = null;

  if (isMemoActive && isCacheHit) {
    borderStyle = 'border-emerald-500 bg-emerald-950/90 text-emerald-200 ring-2 ring-emerald-500/50 shadow-lg';
    badge = (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow flex items-center gap-1 whitespace-nowrap">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>CACHE HIT (O(1))</span>
      </div>
    );
  } else if (!isMemoActive && isDuplicate) {
    borderStyle = 'border-rose-500 bg-rose-950/90 text-rose-200 ring-2 ring-rose-500/50 shadow-lg animate-pulse';
    badge = (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow flex items-center gap-1 whitespace-nowrap">
        <Flame className="w-2.5 h-2.5" />
        <span>REDUNDANT</span>
      </div>
    );
  } else if (isBase) {
    borderStyle = 'border-amber-400 bg-amber-950/70 text-amber-200';
    badge = (
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow">
        Base
      </div>
    );
  }

  return (
    <div className={`relative px-3 py-2 rounded-xl border-2 text-center transition-all ${borderStyle} min-w-[95px] cursor-grab active:cursor-grabbing`}>
      {badge}
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="font-mono text-xs font-bold">
        fib({val})
      </div>
      <div className="text-[9px] text-slate-400 font-sans">
        {isMemoActive && isCacheHit ? 'looked up in memo' : isBase ? 'base case' : 'computed & cached'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  memoCallNode: MemoCallNode,
};

function MemoizationContent() {
  const [n, setN] = useState(5);
  const [isMemoActive, setIsMemoActive] = useState(true); // Default with memoization active!
  const hops = [1, 2];

  // Build tree & notebook state
  const { initialNodes, initialEdges, totalCalls, memoNotebook, cacheHitCount } = useMemo(() => {
    let idCounter = 0;
    const memo = {};
    const seenValues = new Set();
    const nodeList = [];
    const edgeList = [];
    let hits = 0;

    // Fibonacci computation helper
    function getFibVal(k) {
      if (k <= 2) return 1;
      return getFibVal(k - 1) + getFibVal(k - 2);
    }

    // Step 1: recursively build hierarchy
    function buildHierarchy(val, depth) {
      idCounter++;
      const currentId = `call-${idCounter}`;
      const isBase = val <= 2;
      const isFirst = !seenValues.has(val);
      const isDuplicate = !isFirst;
      const isCacheHit = isMemoActive && isDuplicate;

      if (isFirst) {
        seenValues.add(val);
        memo[val] = getFibVal(val);
      } else if (isMemoActive) {
        hits++;
      }

      const node = {
        id: currentId,
        val,
        depth,
        isBase,
        isDuplicate,
        isCacheHit,
        children: []
      };

      // If memoized and is duplicate, PRUNE CHILDREN! (Commandment 1: Look before you leap)
      if (isMemoActive && isDuplicate) {
        return node;
      }

      if (!isBase && depth < 5) {
        for (const hop of hops) {
          const nextVal = val - hop;
          if (nextVal >= 1) {
            node.children.push(buildHierarchy(nextVal, depth + 1));
          }
        }
      }

      return node;
    }

    const root = buildHierarchy(n, 0);

    // Step 2: Non-overlapping leaf slotting
    let leafSlot = 0;
    const SLOT_WIDTH = 120;

    function assignCoordinates(node, parentId = null) {
      if (node.children.length === 0) {
        node.x = leafSlot * SLOT_WIDTH;
        leafSlot++;
      } else {
        node.children.forEach(child => assignCoordinates(child, node.id));
        const firstX = node.children[0].x;
        const lastX = node.children[node.children.length - 1].x;
        node.x = (firstX + lastX) / 2;
      }
      node.y = 25 + node.depth * 75;

      nodeList.push({
        id: node.id,
        type: 'memoCallNode',
        position: { x: node.x, y: node.y },
        draggable: true,
        data: {
          val: node.val,
          isDuplicate: node.isDuplicate,
          isBase: node.isBase,
          isCacheHit: node.isCacheHit,
          isMemoActive
        }
      });

      if (parentId) {
        edgeList.push({
          id: `edge-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          animated: node.isCacheHit,
          style: {
            stroke: node.isCacheHit ? '#10b981' : node.isDuplicate && !isMemoActive ? '#f43f5e' : '#475569',
            strokeWidth: node.isCacheHit ? 2.5 : 1.5
          }
        });
      }
    }

    assignCoordinates(root, null);

    return {
      initialNodes: nodeList,
      initialEdges: edgeList,
      totalCalls: idCounter,
      memoNotebook: memo,
      cacheHitCount: hits
    };
  }, [n, isMemoActive]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Chapter 2 Theme */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Chapter 2 · Turning Recursion Into Memoization
            </div>
            <h3 className="font-bold text-white text-sm">
              The Notebook: Pruning Trees from O(2ⁿ) to O(n)
            </h3>
          </div>
        </div>

        {/* N selector & Memo Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs gap-1.5">
            <span className="text-slate-400 font-mono">Target:</span>
            {[4, 5, 6, 7].map(val => (
              <button
                key={val}
                onClick={() => setN(val)}
                className={`w-7 h-7 rounded-lg font-mono font-bold text-xs transition ${
                  n === val
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 scale-105'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsMemoActive(!isMemoActive)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow ${
              isMemoActive
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isMemoActive ? 'Notebook ACTIVE (O(n))' : 'Plain Recursion (O(2ⁿ))'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Pruned Tree, Right = Live Notebook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Call Tree Canvas (8 cols) */}
        <div className="lg:col-span-8 h-[380px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-xl">
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-emerald-300 flex items-center gap-1.5 shadow">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isMemoActive ? 'Green nodes = O(1) Cache Hits (Subtrees pruned!)' : 'Red nodes = Redundant calculations'}</span>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.2}
            maxZoom={1.5}
          >
            <Background color="#1e293b" gap={16} size={1} />
            <Controls className="!bg-slate-900 !border-slate-800 !scale-75 !origin-bottom-left" />
          </ReactFlow>
        </div>

        {/* Right: Live Memoization Notebook Table (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>The Notebook: memo = &#123;&#125;</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {Object.keys(memoNotebook).length} entries
              </span>
            </div>

            {/* Notebook Key-Value Pairs */}
            <div className="mt-2 space-y-1.5 max-h-[190px] overflow-y-auto font-mono text-[11px]">
              {Object.entries(memoNotebook).map(([k, v]) => (
                <div key={k} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">memo[{k}]</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="text-emerald-400 font-black">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Summary */}
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Total Calls:</span>
              <span className="text-emerald-300 font-bold">{totalCalls} calls</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Cache Hits:</span>
              <span className="text-emerald-400 font-bold">{cacheHitCount} hits (O(1))</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Complexity:</span>
              <span className="text-white font-bold">{isMemoActive ? 'O(n) Linear' : 'O(2ⁿ) Exponential'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Commandments Banner & Benchmark Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* The Two Commandments */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>The Two Commandments:</span>
          </div>
          <div className="text-slate-300">
            <strong>1. LOOK BEFORE YOU LEAP:</strong> <code>if n in memo: return memo[n]</code>
          </div>
          <div className="text-slate-300">
            <strong>2. WRITE BEFORE YOU LEAVE:</strong> <code>memo[n] = result; return memo[n]</code>
          </div>
        </div>

        {/* Measure the Cure (Worked Example Step 3) */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
          <div className="text-amber-400 font-bold flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" />
            <span>Measure the Cure (Calls Comparison):</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>fib(10):</span> <span>Plain: 109 &rarr; <strong className="text-emerald-400">Memo: 19 calls</strong></span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>fib(20):</span> <span>Plain: 13,529 &rarr; <strong className="text-emerald-400">Memo: 39 calls</strong></span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>fib(30):</span> <span>Plain: 1,664,079 &rarr; <strong className="text-emerald-400">Memo: 59 calls</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemoizationSimulator() {
  return (
    <ReactFlowProvider>
      <MemoizationContent />
    </ReactFlowProvider>
  );
}
