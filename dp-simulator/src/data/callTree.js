// Some recurrences (including LIS) call go for several endpoints from solve.
// Keep those calls connected to the actual outer function, rather than showing
// a forest or cropping playback to the first isolated base case.
export function callTreeNodes(trace) {
  return [
    { id: 'solve', key: 'solve(input)', parent: null, depth: 0, cached: false },
    ...trace.nodes.map(node => ({ ...node, parent: node.parent ?? 'solve', depth: node.depth + 1 })),
  ];
}

// Reserve leaf slots so calls in the same view stay in place during playback.
export function layoutCallTree(nodes) {
  const calls = nodes.slice(0, 120);
  const children = new Map(calls.map(node => [node.id, []]));
  const roots = [];
  for (const node of calls) {
    if (children.has(node.parent)) children.get(node.parent).push(node);
    else roots.push(node);
  }
  const positions = new Map();
  let leaf = 0;
  function place(node) {
    const branch = children.get(node.id);
    branch.forEach(place);
    const x = branch.length
      ? (positions.get(branch[0].id).x + positions.get(branch.at(-1).id).x) / 2
      : leaf++ * 170;
    positions.set(node.id, { x, y: node.depth * 110 });
  }
  roots.forEach(place);
  return calls.map(node => ({ ...node, position: positions.get(node.id) }));
}
