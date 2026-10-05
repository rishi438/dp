import Playback from '../Playback';
import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Binary } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BitmaskSimulator({ input }) {
  const n = input?.dist.length ?? 4;
  const cityNames = Array.from({ length: n }, (_, i) => `City ${i}`);
  const dist = input?.dist ?? [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
  ];

  const cityCoords = Array.from({ length: n }, (_, i) => ({ x: 230 + 140 * Math.cos(i * 2 * Math.PI / n), y: 145 + 105 * Math.sin(i * 2 * Math.PI / n) }));

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [activeLang, setActiveLang] = useState('python');

  // Precompute Held-Karp TSP steps
  const { steps, finalDp } = useMemo(() => {
    const numMasks = 1 << n; // 16
    const dp = Array.from({ length: numMasks }, () => Array(n).fill(Infinity));
    const parent = Array.from({ length: numMasks }, () => Array(n).fill(-1));
    const allSteps = [];

    // Base case: start at 0, mask = 1 (binary 0001)
    dp[1][0] = 0;
    allSteps.push({
      mask: 1,
      maskStr: '1'.padStart(n, '0'),
      u: 0,
      cost: 0,
      prevCity: null,
      line: 3,
      desc: `Base case: dp[${'1'.padStart(n, '0')}][0] = 0. Starting at City 0.`,
      tableSnapshot: dp.map(row => [...row])
    });

    // Sort masks by bit count (popcount) to process bottom-up
    const masksByPop = [];
    for (let m = 1; m < numMasks; m++) {
      let count = 0;
      for (let i = 0; i < n; i++) if (m & (1 << i)) count++;
      masksByPop.push({ mask: m, count });
    }
    masksByPop.sort((a, b) => a.count - b.count);

    // Held-Karp recurrence
    for (const { mask, count } of masksByPop) {
      if (mask === 1) continue; // Already handled
      if (!(mask & 1)) continue; // Must contain start city 0

      for (let u = 1; u < n; u++) {
        if (mask & (1 << u)) {
          const prevMask = mask ^ (1 << u);
          let minVal = Infinity;
          let bestPrev = -1;

          for (let v = 0; v < n; v++) {
            if (prevMask & (1 << v)) {
              const cand = dp[prevMask][v] + dist[v][u];
              if (cand < minVal) {
                minVal = cand;
                bestPrev = v;
              }
            }
          }

          if (minVal !== Infinity) {
            dp[mask][u] = minVal;
            parent[mask][u] = bestPrev;

            allSteps.push({
              mask,
              maskStr: mask.toString(2).padStart(n, '0'),
              u,
              cost: minVal,
              prevCity: bestPrev,
              line: 8,
              desc: `Mask ${mask.toString(2).padStart(n, '0')} (size ${count}), end at City ${u}: min path via City ${bestPrev} = ${minVal} km.`,
              tableSnapshot: dp.map(row => [...row])
            });
          }
        }
      }
    }

    // Final step: close tour back to 0
    let bestTour = Infinity;
    let lastCity = -1;
    for (let u = 1; u < n; u++) {
      const tourCost = dp[numMasks - 1][u] + dist[u][0];
      if (tourCost < bestTour) {
        bestTour = tourCost;
        lastCity = u;
      }
    }

    allSteps.push({
      mask: numMasks - 1,
      maskStr: '1111',
      u: 0,
      cost: bestTour,
      prevCity: lastCity,
      line: 11,
      desc: `Full tour complete! Return to City 0 from City ${lastCity}: Total cost = ${bestTour} km.`,
      tableSnapshot: dp.map(row => [...row])
    });

    return { steps: allSteps, finalDp: dp };
  }, [n]);

  const activeStep = steps[currentStepIndex] || steps[0];

  const playback = useAutoplay({ playing: isPlaying, step: currentStepIndex, last: steps.length - 1, speed, setSpeed, onStep: setCurrentStepIndex, onStop: setIsPlaying });

  const pythonCode = [
    { num: 1, text: "def tsp_held_karp(dist: list[list[int]]) -> int:" },
    { num: 2, text: "    n = len(dist); dp = [[float('inf')] * n for _ in range(1 << n)]" },
    { num: 3, text: "    dp[1][0] = 0  # base: visited {0}, at city 0" },
    { num: 4, text: "    for mask in range(1, 1 << n):" },
    { num: 5, text: "        if not (mask & 1): continue  # must include start 0" },
    { num: 6, text: "        for u in range(n):" },
    { num: 7, text: "            if not (mask & (1 << u)): continue" },
    { num: 8, text: "            prev_mask = mask ^ (1 << u)" },
    { num: 9, text: "            for v in range(n):" },
    { num: 10, text: "                if prev_mask & (1 << v):" },
    { num: 11, text: "                    dp[mask][u] = min(dp[mask][u], dp[prev_mask][v] + dist[v][u])" },
    { num: 12, text: "    return min(dp[(1 << n) - 1][u] + dist[u][0] for u in range(1, n))" }
  ];

  const rustCode = [
    { num: 1, text: "pub fn tsp_held_karp(dist: &[Vec<u32>]) -> u32 {" },
    { num: 2, text: "    let n = dist.len();" },
    { num: 3, text: "    let mut dp = vec![vec![u32::MAX / 2; n]; 1 << n];" },
    { num: 4, text: "    dp[1][0] = 0;" },
    { num: 5, text: "    for mask in 1..(1 << n) {" },
    { num: 6, text: "        if mask & 1 == 0 { continue; }" },
    { num: 7, text: "        for u in 1..n {" },
    { num: 8, text: "            if mask & (1 << u) != 0 {" },
    { num: 9, text: "                let prev = mask ^ (1 << u);" },
    { num: 10, text: "                for v in 0..n {" },
    { num: 11, text: "                    if prev & (1 << v) != 0 {" },
    { num: 12, text: "                        dp[mask][u] = dp[mask][u].min(dp[prev][v] + dist[v][u]);" },
    { num: 13, text: "                    }" },
    { num: 14, text: "                }" },
    { num: 15, text: "            }" },
    { num: 16, text: "        }" },
    { num: 17, text: "    }" },
    { num: 18, text: "    (1..n).map(|u| dp[(1 << n) - 1][u] + dist[u][0]).min().unwrap()" },
    { num: 19, text: "}" }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-xl">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-950 px-2 py-0.5 rounded border border-violet-800">
                Chapter 15 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Maska the Bit-Witch</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Bitmask DP · Traveling Salesperson (Held-Karp)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Playback compact playback={playback} length={steps.length} />

        </div>
      </div>

      {/* Main Dual Grid: Graph Map & Bitmask Register vs Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 4-City Map + Active Bitmask Register */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Bitmask Register HUD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
              <span>Active Bitmask Register: 2^{n} = {1 << n} Subsets</span>
              <span className="text-[11px] font-mono text-violet-400">Step {currentStepIndex + 1} / {steps.length}</span>
            </div>

            {/* 4-Bit Illuminated Register */}
            <div style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} className="grid gap-2">
              {Array.from({ length: n }, (_, i) => n - 1 - i).map(bitIdx => {
                const isBitSet = Boolean(activeStep.mask & (1 << bitIdx));
                const isCurrentCity = activeStep.u === bitIdx;

                return (
                  <div
                    key={bitIdx}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrentCity
                        ? 'bg-violet-500/25 border-violet-400 text-violet-100 ring-2 ring-violet-400'
                        : isBitSet
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono">
                      <span>Bit {bitIdx}</span>
                      <span className={`w-2 h-2 rounded-full ${isBitSet ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-700'}`} />
                    </div>
                    <div className="text-xl font-mono font-black mt-1">
                      {isBitSet ? '1' : '0'}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-semibold truncate mt-0.5">
                      {cityNames[bitIdx]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SVG Map of 4 cities */}
            <div className="relative mt-4 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 flex items-center justify-center">
              <svg width="100%" height="280" viewBox="0 0 460 280">
                {/* Distance edges */}
                {Array.from({ length: n }, (_, u) => Array.from({ length: n - u - 1 }, (_, i) => [u, u + i + 1])).flat().map(([u, v]) => {
                  const p1 = cityCoords[u];
                  const p2 = cityCoords[v];
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;

                  const isPathEdge = (activeStep.u === u && activeStep.prevCity === v) ||
                                     (activeStep.u === v && activeStep.prevCity === u);

                  return (
                    <g key={`${u}-${v}`}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isPathEdge ? '#8b5cf6' : '#334155'}
                        strokeWidth={isPathEdge ? '3.5' : '1.5'}
                        strokeDasharray={isPathEdge ? 'none' : '4 4'}
                      />
                      <rect
                        x={midX - 14}
                        y={midY - 8}
                        width="28"
                        height="16"
                        fill="#090d16"
                        rx="4"
                        stroke="#1e293b"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {dist[u][v]}
                      </text>
                    </g>
                  );
                })}

                {/* Cities */}
                {cityCoords.map((coord, idx) => {
                  const isVisited = Boolean(activeStep.mask & (1 << idx));
                  const isCurrent = activeStep.u === idx;

                  return (
                    <g key={idx} transform={`translate(${coord.x}, ${coord.y})`}>
                      {isCurrent && (
                        <circle r="26" fill="none" stroke="#a78bfa" strokeWidth="2.5" className="animate-pulse" />
                      )}
                      <circle
                        r="20"
                        fill={isCurrent ? '#5b21b6' : isVisited ? '#065f46' : '#1e293b'}
                        stroke={isCurrent ? '#c4b5fd' : isVisited ? '#34d399' : '#475569'}
                        strokeWidth="2"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {idx}
                      </text>
                      <text
                        textAnchor="middle"
                        dy="32"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {cityNames[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Step Explanation Callout */}
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-semibold text-white">{activeStep.desc}</div>
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
                      ? 'bg-violet-500/20 text-violet-200 border-l-2 border-violet-400 font-bold'
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
              <span>Time: <span className="text-violet-400 font-bold">O(2ᴺ · N²)</span></span>
              <span>Space: <span className="text-violet-400 font-bold">O(2ᴺ · N)</span></span>
              <span>Brute Force: <span className="text-rose-400 font-bold">O(N!)</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
