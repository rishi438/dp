import { useEffect, useRef, useState, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceY,
  forceX
} from 'd3-force';

/**
 * useForceLayout Hook
 * Runs a physics-based force simulation using d3-force for xyflow nodes and edges.
 *
 * @param {Object} params
 * @param {Array} params.nodes - Nodes to simulate [{ id, position: { x, y }, depth }]
 * @param {Array} params.edges - Edges to simulate [{ source, target }]
 * @param {boolean} params.enabled - Whether force simulation is active
 * @param {number} params.strength - Repulsion force strength (default: -350)
 * @param {number} params.distance - Link distance (default: 130)
 * @param {number} params.collideRadius - Collision radius (default: 65)
 * @returns {Map<string, {x: number, y: number}>|null} Map of node ID to simulated position
 */
export function useForceLayout({
  nodes = [],
  edges = [],
  enabled = false,
  strength = -350,
  distance = 130,
  collideRadius = 65
}) {
  const [positions, setPositions] = useState(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!enabled || !nodes.length) {
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
      setPositions(null);
      return;
    }

    // Prepare simulation nodes and links
    const simNodes = nodes.map(n => {
      const pos = n.position || { x: 0, y: 0 };
      return {
        id: String(n.id),
        x: pos.x,
        y: pos.y,
        depth: n.depth !== undefined ? n.depth : 0,
        targetY: pos.y
      };
    });

    const nodeIds = new Set(simNodes.map(d => d.id));
    const simLinks = edges
      .filter(e => nodeIds.has(String(e.source)) && nodeIds.has(String(e.target)))
      .map(e => ({
        source: String(e.source),
        target: String(e.target)
      }));

    // Setup d3-force simulation
    const simulation = forceSimulation(simNodes)
      .force('charge', forceManyBody().strength(strength))
      .force('link', forceLink(simLinks).id(d => d.id).distance(distance).strength(0.7))
      .force('collide', forceCollide(collideRadius))
      .force('y', forceY(d => (d.depth ? d.depth * 110 : d.targetY || 100)).strength(0.2))
      .alpha(1)
      .alphaDecay(0.025);

    simulation.on('tick', () => {
      const posMap = new Map();
      simNodes.forEach(node => {
        posMap.set(node.id, {
          x: Math.round(node.x),
          y: Math.round(node.y)
        });
      });
      setPositions(new Map(posMap));
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [enabled, nodes.length, edges.length, strength, distance, collideRadius]);

  return positions;
}
