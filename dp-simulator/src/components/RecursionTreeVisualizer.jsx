import React, { useState, useMemo, useEffect } from 'react';
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
import { Flame, CheckCircle2, Zap, Move } from 'lucide-react';

// Custom Node for the Recursion Call Tree
function CallNode({ data }) {
  const { n, isDuplicate, isMemoized, isBase, isCacheHit } = data;

  let borderStyle = 'border-slate-700 bg-slate-900 text-slate-200';
  let badge = null;

  if (isCacheHit) {
    borderStyle = 'border-emerald-500 bg-emerald-950/90 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg';
    badge = (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow flex items-center gap-1 whitespace-nowrap">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>CACHE HIT</span>
      </div>
    );
  } else if (isDuplicate && !isMemoized) {
    borderStyle = 'border-rose-500 bg-rose-950/90 text-rose-200 ring-2 ring-rose-500/50 shadow-lg animate-pulse';
    badge = (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow flex items-center gap-1 whitespace-nowrap">
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
    <div className={`relative px-2.5 py-1.5 rounded-xl border-2 text-center transition-all ${borderStyle} min-w-[85px] cursor-grab active:cursor-grabbing`}>
      {badge}
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="font-mono text-xs font-bold">
        f({n})
      </div>
      <div className="text-[9px] text-slate-400 font-sans">
        {isCacheHit ? 'O(1) hit' : isBase ? 'base case' : 'calculating'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  callNode: CallNode,
};

function RecursionTreeContent({ n = 4, hops = [1, 2] }) {
  const [useMemoization, setUseMemoization] = useState(false);

  // Mathematically guaranteed non-overlapping leaf-slot layout
  const { initialNodes, initialEdges, totalCalls } = useMemo(() => {
    let idCounter = 0;
    const seenValues = new Set();
    const nodeList = [];
    const edgeList = [];

    // Step 1: recursively build tree hierarchy
    function buildHierarchy(val, depth) {
      idCounter++;
      const currentId = `call-${idCounter}`;
      const isBase = val <= 1;
      const isFirst = !seenValues.has(val);
      const isDuplicate = !isFirst;
      const isCacheHit = useMemoization && isDuplicate;

      if (isFirst) {
        seenValues.add(val);
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

      // Prune if memoized duplicate or base or depth limit
      if (useMemoization && isDuplicate) {
        return node;
      }

      if (!isBase && depth < 4) {
        for (const hop of hops) {
          const nextVal = val - hop;
          if (nextVal >= 0) {
            node.children.push(buildHierarchy(nextVal, depth + 1));
          }
        }
      }

      return node;
    }

    const root = buildHierarchy(Math.min(n, 5), 0);

    // Step 2: In-order leaf slotting guarantees ZERO node overlap
    let leafSlot = 0;
    const SLOT_WIDTH = 115; // 85px node + 30px guaranteed gap

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
      node.y = 25 + node.depth * 80;

      nodeList.push({
        id: node.id,
        type: 'callNode',
        position: { x: node.x, y: node.y },
        draggable: true,
        data: {
          n: node.val,
          isDuplicate: node.isDuplicate,
          isMemoized: useMemoization,
          isBase: node.isBase,
          isCacheHit: node.isCacheHit
        }
      });

      if (parentId) {
        edgeList.push({
          id: `edge-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          animated: node.isCacheHit,
          style: {
            stroke: node.isCacheHit ? '#10b981' : node.isDuplicate && !useMemoization ? '#f43f5e' : '#475569',
            strokeWidth: node.isCacheHit ? 2.5 : 1.5
          }
        });
      }
    }

    assignCoordinates(root, null);

    return {
      initialNodes: nodeList,
      initialEdges: edgeList,
      totalCalls: idCounter
    };
  }, [n, hops, useMemoization]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="space-y-3">
      {/* Control Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-200">
              Recursion Tree: The Pain of Repeated Work
            </h3>
            <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
              useMemoization ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {useMemoization ? 'Chapter 2 · The Notebook (Memo)' : 'Chapter 1 · Plain Recursion'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {useMemoization
              ? 'Notebook is active: duplicate subproblems return in O(1) without re-branching!'
              : 'Plain recursion: watch identical subtrees expand repeatedly in red!'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-slate-400">Total Calls: </span>
            <span className={`font-mono font-bold ${useMemoization ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalCalls} calls
            </span>
          </div>

          <button
            onClick={() => setUseMemoization(!useMemoization)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow ${
              useMemoization
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{useMemoization ? 'Notebook Active' : 'Activate Notebook'}</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-xl">
        <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/90 border border-slate-800 rounded-md px-2 py-1 text-[10px] text-slate-300 flex items-center gap-1.5">
          <Move className="w-3 h-3 text-cyan-400" />
          <span>Nodes are now freely movable · Drag anywhere</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
        >
          <Background color="#1e293b" gap={16} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !scale-75 !origin-bottom-left" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function RecursionTreeVisualizer(props) {
  return (
    <ReactFlowProvider>
      <RecursionTreeContent {...props} />
    </ReactFlowProvider>
  );
}
