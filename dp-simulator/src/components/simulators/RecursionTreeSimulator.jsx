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
import { Flame, GitBranch, AlertTriangle, Clock, TrendingUp, Info } from 'lucide-react';

// Custom Node for Chapter 1: Plain Recursion Call Tree
function PlainCallNode({ data }) {
  const { val, isDuplicate, isBase, count } = data;

  let borderStyle = 'border-slate-700 bg-slate-900 text-slate-200';
  let badge = null;

  if (isDuplicate) {
    borderStyle = 'border-rose-500 bg-rose-950/90 text-rose-200 ring-2 ring-rose-500/50 shadow-lg animate-pulse';
    badge = (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow flex items-center gap-1 whitespace-nowrap">
        <Flame className="w-2.5 h-2.5" />
        <span>REDUNDANT ({count}×)</span>
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
    <div className={`relative px-3 py-2 rounded-xl border-2 text-center transition-all ${borderStyle} min-w-[90px] cursor-grab active:cursor-grabbing`}>
      {badge}
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="font-mono text-xs font-bold">
        fib({val})
      </div>
      <div className="text-[9px] text-slate-400 font-sans">
        {isDuplicate ? 'wasted recompute' : isBase ? 'base case' : 'recursing'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  plainCallNode: PlainCallNode,
};

function RecursionTreeContent() {
  const [n, setN] = useState(5); // Default fib(5)
  const hops = [1, 2];

  // Build tree hierarchy for naive fib(n) without memoization
  const { initialNodes, initialEdges, totalCalls, duplicateCounts } = useMemo(() => {
    let idCounter = 0;
    const occurrenceMap = {};
    const nodeList = [];
    const edgeList = [];

    // Step 1: recursively build tree hierarchy
    function buildHierarchy(val, depth) {
      idCounter++;
      const currentId = `call-${idCounter}`;
      const isBase = val <= 2;

      occurrenceMap[val] = (occurrenceMap[val] || 0) + 1;
      const count = occurrenceMap[val];
      const isDuplicate = count > 1;

      const node = {
        id: currentId,
        val,
        depth,
        isBase,
        isDuplicate,
        count,
        children: []
      };

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

    // Step 2: In-order leaf slotting guarantees ZERO node overlap
    let leafSlot = 0;
    const SLOT_WIDTH = 115;

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
        type: 'plainCallNode',
        position: { x: node.x, y: node.y },
        draggable: true,
        data: {
          val: node.val,
          isDuplicate: node.isDuplicate,
          isBase: node.isBase,
          count: node.count
        }
      });

      if (parentId) {
        edgeList.push({
          id: `edge-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          style: {
            stroke: node.isDuplicate ? '#f43f5e' : '#475569',
            strokeWidth: node.isDuplicate ? 2 : 1.5
          }
        });
      }
    }

    assignCoordinates(root, null);

    return {
      initialNodes: nodeList,
      initialEdges: edgeList,
      totalCalls: idCounter,
      duplicateCounts: occurrenceMap
    };
  }, [n]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Chapter 1 Rule */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
              Chapter 1 · Watching Plain Recursion Explode
            </div>
            <h3 className="font-bold text-white text-sm">
              Tree of Waste: Exponential Redundancy O(2ⁿ)
            </h3>
          </div>
        </div>

        {/* N selector & Call stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs gap-1.5">
            <span className="text-slate-400 font-mono">Target:</span>
            {[3, 4, 5, 6].map(val => (
              <button
                key={val}
                onClick={() => setN(val)}
                className={`w-7 h-7 rounded-lg font-mono font-bold text-xs transition ${
                  n === val
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50 scale-105'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="px-3 py-1.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 font-mono font-bold">
            Total Calls: {totalCalls}
          </div>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-xl">
        <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-rose-300 flex items-center gap-1.5 shadow">
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Red nodes = redundant recomputations! Drag nodes to inspect</span>
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

      {/* Chapter 1 Waste Analysis & Measurement Panel (Answers C1, C2, C3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Subproblem Multiplicity (Challenge 1) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <Flame className="w-4 h-4" />
            <span>Eyeball Waste Count for fib({n}):</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
            {[2, 3, 4].filter(val => val < n).map(val => (
              <div key={val} className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-500">fib({val})</div>
                <div className="text-sm font-black text-rose-400 mt-0.5">
                  {duplicateCounts[val] || 1}×
                </div>
              </div>
            ))}
            <div className="p-2 bg-rose-950/40 border border-rose-500/40 rounded-lg">
              <div className="text-[10px] text-rose-300">Wasted Calls</div>
              <div className="text-sm font-black text-white mt-0.5">
                {Math.max(0, totalCalls - (2 * n - 1))}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Every branch re-computes subproblems that sibling branches already calculated!
          </div>
        </div>

        {/* Exponential Growth Benchmarks (Challenge 2 & 3) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Call Growth Rate: O(2ⁿ) Pain</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>fib(10):</span> <span className="text-white font-bold">109 calls</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>fib(20):</span> <span className="text-rose-400 font-bold">13,529 calls (~124× growth)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>fib(30):</span> <span className="text-rose-500 font-bold">1,664,079 calls (~123× growth)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-0.5">
            10 steps up multiplies total work by <strong>~123×</strong>!
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecursionTreeSimulator() {
  return (
    <ReactFlowProvider>
      <RecursionTreeContent />
    </ReactFlowProvider>
  );
}
