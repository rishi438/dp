import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Coins, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoinChangeSimulator({ input }) {
  const [targetAmount, setTargetAmount] = useState(input?.amount ?? 11);
  const coins = input?.coins ?? [1, 2, 5];
  const [currentAmount, setCurrentAmount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);

  // Compute DP table for all amounts 0..targetAmount
  const dpData = useMemo(() => {
    const table = [];
    for (let a = 0; a <= targetAmount; a++) {
      if (a === 0) {
        table.push({ val: 0, bestCoin: null, doors: [], coinsUsed: [] });
      } else {
        let minCoins = Infinity;
        let chosenCoin = null;
        const doors = [];

        for (const c of coins) {
          if (a - c >= 0) {
            const prev = table[a - c].val;
            const candidate = prev >= 0 && prev !== Infinity ? prev + 1 : Infinity;
            const isFeasible = prev >= 0 && prev !== Infinity;
            if (candidate < minCoins) {
              minCoins = candidate;
              chosenCoin = c;
            }
            doors.push({
              coin: c,
              prevAmount: a - c,
              prevVal: prev,
              total: candidate,
              feasible: isFeasible
            });
          }
        }

        const coinsUsed = chosenCoin !== null && table[a - chosenCoin]
          ? [...table[a - chosenCoin].coinsUsed, chosenCoin]
          : [];

        table.push({
          val: minCoins === Infinity ? -1 : minCoins,
          bestCoin: chosenCoin,
          doors: doors.map(d => ({ ...d, chosen: d.coin === chosenCoin })),
          coinsUsed
        });
      }
    }
    return table;
  }, [targetAmount, coins]);

  useAutoplay({ playing: isPlaying, step: currentAmount, last: targetAmount, speed, onStep: setCurrentAmount, onStop: setIsPlaying });

  const activeItem = dpData[currentAmount] || dpData[0];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                Chapter 5 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Corin the Coinsmith</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Coin Change: Choosing from a Set · Target Amount: ${targetAmount}
            </h2>
          </div>
        </div>

        {/* Target Amount Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Target $:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[6, 8, 10, 11, 13, 15].map(amt => (
              <button
                key={amt}
                onClick={() => {
                  setTargetAmount(amt);
                  setCurrentAmount(0);
                  setIsPlaying(false);
                }}
                className={`w-7 h-7 text-xs font-bold rounded-lg transition ${
                  targetAmount === amt
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentAmount(0);
              setIsPlaying(false);
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentAmount(p => Math.max(0, p - 1));
            }}
            disabled={currentAmount === 0}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition"
          >
            Prev
          </button>
          <button
            onClick={() => {
              if (currentAmount >= targetAmount) {
                setCurrentAmount(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className={`px-4 py-1 text-xs font-black rounded-lg transition shadow ${
              isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}
          >
            {isPlaying ? 'Pause' : (currentAmount >= targetAmount ? 'Replay' : 'Step Through')}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentAmount(p => Math.min(targetAmount, p + 1));
            }}
            disabled={currentAmount === targetAmount}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Amount Array & Doors, Right = Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: The Coin Change Table Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Amount Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  Evaluating Amount: ${currentAmount}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available Coin Set: <strong className="text-slate-200">[1, 2, 5]</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Min Coins:</span>
                <div className="text-xl font-black font-mono text-emerald-400">
                  {activeItem.val !== -1 ? `${activeItem.val} coins` : 'Impossible'}
                </div>
              </div>
            </div>

            {/* The 3 Coin Doors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                The Coin Doors: What was the LAST coin picked?
              </span>

              {activeItem.doors.length === 0 ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300">
                  Base Amount $0: Exactly 0 coins needed.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activeItem.doors.map((door) => (
                    <div
                      key={door.coin}
                      className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition ${
                        door.chosen
                          ? 'bg-amber-950/40 border-amber-500 text-amber-100 ring-2 ring-amber-500/40 shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">Coin: ${door.coin}</span>
                        {door.chosen && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                            BEST
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        From ${door.prevAmount} (dp[{door.prevAmount}] = {door.prevVal})
                      </div>
                      <div className="text-xs font-mono font-bold mt-1 text-slate-200">
                        Total = {door.total} coins
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coins Combination Picked */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Coins Used for ${currentAmount}:</span>
              <div className="flex items-center gap-1.5">
                {activeItem.coinsUsed.length === 0 ? (
                  <span className="text-slate-500 italic">None (at $0)</span>
                ) : (
                  activeItem.coinsUsed.map((c, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shadow"
                    >
                      ${c}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Amount Array Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Tabulation Table: dp[0..{targetAmount}] (Minimum Coins)
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {dpData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentAmount(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                    idx === currentAmount
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-105'
                      : idx < currentAmount
                      ? 'bg-slate-950 border-slate-700 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-600'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 font-mono">${idx}</div>
                  <div className="text-base font-bold mt-0.5">
                    {idx <= currentAmount ? (item.val === -1 ? '∞' : item.val) : '?'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Synchronized Code Viewer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <span className="text-xs font-bold text-slate-200">Python: Coin Change</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                O(amount × coins)
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div className="text-slate-500">def coin_change(coins, amount):</div>
              <div className="pl-4 text-slate-500">dp = [float('inf')] * (amount + 1)</div>
              <div className={`pl-4 py-0.5 rounded ${currentAmount === 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200' : ''}`}>
                dp[0] = 0  # Base case: $0 takes 0 coins
              </div>
              <div className="pl-4 text-slate-500">for a in range(1, amount + 1):</div>
              <div className="pl-8 text-slate-500">for c in coins:</div>
              <div className={`pl-12 py-0.5 rounded ${currentAmount > 0 && currentAmount < targetAmount ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200' : ''}`}>
                if a - c &gt;= 0:
              </div>
              <div className={`pl-16 py-0.5 rounded ${currentAmount > 0 && currentAmount < targetAmount ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200' : ''}`}>
                dp[a] = min(dp[a], 1 + dp[a - c])
              </div>
              <div className={`pl-4 py-0.5 rounded ${currentAmount === targetAmount ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200' : ''}`}>
                return dp[amount] if dp[amount] != inf else -1
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-amber-400 block mb-1">Corin's Lesson:</strong>
            "The doors come from the data array <code className="text-cyan-300">[1, 2, 5]</code>. The fulcrum became a loop over coins, and we pick the cheapest door with <code className="text-emerald-400">min</code>."
          </div>
        </div>
      </div>
    </div>
  );
}
