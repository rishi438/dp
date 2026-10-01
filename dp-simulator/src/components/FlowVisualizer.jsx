import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  ControlButton,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow
} from '@xyflow/react';
import { Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { useForceLayout } from '../hooks/useForceLayout';
import DPNode from './DPNode';
import DoorEdge from './DoorEdge';

const nodeTypes = {
  dpNode: DPNode,
};

const edgeTypes = {
  doorEdge: DoorEdge,
};

function FlowVisualizerContent({
  problem,
  n,
  currentStep,
  dpResults,
  terminationIndex,
  onSelectStep,
  computedStates,
  expanded,
  onExpand,
  playbackControls
}) {
  const [usePhysics, setUsePhysics] = useState(false);
  const { setCenter } = useReactFlow();

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const isGold = problem.isGold;
    const gold = problem.goldValues || [];

    for (let i = 0; i <= n; i++) {
      const isBase = i === 0 || (problem.id === 'frog12' && i === 1);
      const isActive = i === currentStep;
      const isTermination = i === terminationIndex;
      const isComputed = computedStates ? computedStates.has(i) : i <= currentStep;
      const cell = dpResults[i];

      const isDependency = cell?.doors?.some(d => d.from === i) || (
        dpResults[currentStep]?.doors?.some(d => d.from === i)
      );

      // Compact ascending staircase
      const x = 30 + i * 160;
      const y = 290 - i * 42;

      nodes.push({
        id: `node-${i}`,
        type: 'dpNode',
        position: { x, y },
        data: {
          index: i,
          val: cell?.val,
          isBase,
          isActive,
          isDependency,
          isTermination,
          isComputed,
          isGold,
          goldVal: isGold ? gold[i] : undefined,
          onClick: () => onSelectStep(i)
        }
      });

      if (cell && cell.doors) {
        cell.doors.forEach((door) => {
          const isEdgeToActive = i === currentStep;

          edges.push({
            id: `edge-${door.from}-to-${i}`,
            source: `node-${door.from}`,
            target: `node-${i}`,
            type: 'doorEdge',
            data: {
              doorNum: door.hop,
              hopSize: door.hop,
              contribution: isGold ? door.total : door.contribution,
              isActiveDoor: isEdgeToActive,
              isChosen: door.chosen
            },
            animated: isEdgeToActive
          });
        });
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [problem, n, currentStep, dpResults, terminationIndex, onSelectStep, computedStates]);

  const forcePositions = useForceLayout({
    nodes: initialNodes,
    edges: initialEdges,
    enabled: usePhysics,
    strength: -320,
    distance: 140
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (usePhysics && forcePositions) {
      setNodes(nds => nds.map(n => ({
        ...n,
        position: forcePositions.get(n.id) || n.position
      })));
    } else {
      setNodes(initialNodes);
    }
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges, usePhysics, forcePositions]);

  useEffect(() => {
    const activeNode = initialNodes.find(nd => nd.data.isActive);
    if (activeNode) {
      setCenter(activeNode.position.x + 50, activeNode.position.y + 40, {
        duration: 500,
        zoom: 1.1
      });
    }
  }, [currentStep, setCenter, initialNodes]);

  return (
    <div className={`staircase-graph w-full h-[380px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-xl ${playbackControls ? 'has-playback-dock' : ''}`}>
      <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-md px-2 py-1 text-[10px] text-slate-300 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span className="font-bold">Subproblem DAG</span>
        <span className="text-slate-500">· Drag / Zoom {usePhysics ? '· ⚛ Physics' : ''}</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={16} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !scale-75 !origin-bottom-left">
          <ControlButton
            onClick={() => setUsePhysics(p => !p)}
            title={usePhysics ? "Switch to Staircase Layout" : "Simulate Force Layout (d3-force)"}
            aria-label={usePhysics ? "Staircase layout" : "Physics simulation"}
          >
            <Sparkles size={14} className={usePhysics ? "!text-amber-400" : ""} />
          </ControlButton>
          <ControlButton
            onClick={onExpand}
            title={expanded ? 'Exit expanded view' : 'Expand simulation within this page'}
            aria-label={expanded ? 'Exit expanded view' : 'Expand simulation'}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </ControlButton>
        </Controls>
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.isActive) return '#38bdf8';
            if (n.data?.isTermination) return '#c084fc';
            if (n.data?.isBase) return '#f59e0b';
            return '#334155';
          }}
          maskColor="rgba(7, 11, 20, 0.7)"
          className="!bottom-2 !right-2 !scale-75 !origin-bottom-right"
        />
      </ReactFlow>
      {playbackControls && <div className="playback-dock">{playbackControls}</div>}
    </div>
  );
}

export default function FlowVisualizer(props) {
  return (
    <ReactFlowProvider>
      <FlowVisualizerContent {...props} />
    </ReactFlowProvider>
  );
}
