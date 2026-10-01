import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

export default function DoorEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { doorNum, hopSize, contribution, isActiveDoor, isChosen } = data || {};

  // Custom stroke color depending on door number
  let strokeColor = '#38bdf8'; // Door 1: Cyan
  if (doorNum === 2) strokeColor = '#f59e0b'; // Door 2: Amber
  if (doorNum === 3) strokeColor = '#ec4899'; // Door 3: Pink

  const activeStyle = {
    ...style,
    stroke: strokeColor,
    strokeWidth: isActiveDoor ? 3.5 : 2,
    strokeDasharray: isActiveDoor ? '6 4' : 'none',
    opacity: isActiveDoor ? 1 : 0.45,
    animation: isActiveDoor ? 'dash 1s linear infinite' : 'none'
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={activeStyle} />
      {isActiveDoor && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="flex items-center gap-1.5 bg-slate-950/95 border border-slate-700/80 rounded-full px-2 py-0.5 shadow-xl text-[10px] font-bold z-20 backdrop-blur"
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-slate-950 font-black"
              style={{ backgroundColor: strokeColor }}
            >
              {doorNum}
            </span>
            <span className="text-slate-200">
              +{hopSize} hop
            </span>
            {contribution !== undefined && (
              <span className="text-emerald-400 font-mono">
                (+{contribution})
              </span>
            )}
            {isChosen && (
              <span className="text-amber-400 text-[9px]">⭐</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
