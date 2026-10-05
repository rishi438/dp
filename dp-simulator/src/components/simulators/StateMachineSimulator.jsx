import Playback from '../Playback';
import { useAutoplay } from '../../hooks/usePlayback';
import React, { useState, useMemo, useEffect } from 'react';
import { Activity, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StateMachineSimulator({ input }) {
  const prices = input?.prices ?? [1, 2, 3, 0, 2];
  const [day, setDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);

  // Compute state machine DP table
  const smData = useMemo(() => {
    const table = [];
    let rest = 0;
    let hold = -prices[0];
    let sold = -Infinity;

    table.push({
      day: 0,
      price: prices[0],
      rest: 0,
      hold: -prices[0],
      sold: -Infinity,
      notes: 'Day 0: Base states initialized'
    });

    for (let i = 1; i < prices.length; i++) {
      const p = prices[i];
      const prevRest = rest;
      const prevHold = hold;
      const prevSold = sold;

      const nextRest = Math.max(prevRest, prevSold === -Infinity ? -Infinity : prevSold);
      const nextHold = Math.max(prevHold, prevRest - p);
      const nextSold = prevHold + p;

      rest = nextRest;
      hold = nextHold;
      sold = nextSold;

      table.push({
        day: i,
        price: p,
        rest: nextRest,
        hold: nextHold,
        sold: nextSold,
        prevRest,
        prevHold,
        prevSold
      });
    }

    return table;
  }, [prices]);

  const playback = useAutoplay({ playing: isPlaying, step: day, last: prices.length - 1, speed, setSpeed, onStep: setDay, onStop: setIsPlaying });

  const curDayData = smData[day] || smData[0];
  const maxProfit = Math.max(curDayData.rest, curDayData.sold === -Infinity ? 0 : curDayData.sold);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                Chapter 11 Designated Simulation
              </span>
              <span className="text-xs text-slate-400 font-semibold">Modus the Mask-Wearer</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              State Machine DP: Stock with 1-Day Cooldown
            </h2>
          </div>
        </div>

        {/* Profit Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Max Legal Profit:</span>
          <span className="text-base font-black font-mono text-emerald-400">
            ${maxProfit}
          </span>
        </div>

        {/* Playback */}
        <Playback compact playback={playback} length={prices.length} />
      </div>

      {/* Main Grid: 3 States Graph + Price Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: The 3 States Graph (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300">
              Day {day} (Stock Price: ${prices[day]})
            </span>
            <span className="text-slate-400 font-mono">
              3 Modes: REST · HOLD · SOLD
            </span>
          </div>

          {/* The 3 States Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Node REST */}
            <div className="p-4 rounded-xl border-2 border-cyan-500/50 bg-cyan-950/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Mode: REST
              </span>
              <div className="text-2xl font-black font-mono text-cyan-200">
                ${curDayData.rest}
              </div>
              <p className="text-[10px] text-slate-400">
                Cash in hand, free to buy
              </p>
            </div>

            {/* Node HOLD */}
            <div className="p-4 rounded-xl border-2 border-amber-500/50 bg-amber-950/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Mode: HOLD
              </span>
              <div className="text-2xl font-black font-mono text-amber-200">
                ${curDayData.hold}
              </div>
              <p className="text-[10px] text-slate-400">
                Holding share, paid entry
              </p>
            </div>

            {/* Node SOLD */}
            <div className="p-4 rounded-xl border-2 border-rose-500/50 bg-rose-950/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Mode: SOLD (Cooldown)
              </span>
              <div className="text-2xl font-black font-mono text-rose-200">
                {curDayData.sold === -Infinity ? '-∞' : `$${curDayData.sold}`}
              </div>
              <p className="text-[10px] text-slate-400">
                Sold today · must rest tomorrow!
              </p>
            </div>
          </div>

          {/* State Transition Flow Explanation */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-slate-200 block mb-1">State Machine Transitions for Day {day}:</span>
            <div className="text-[11px] font-mono text-slate-300 space-y-1">
              <div>• REST: max(stay rest: {curDayData.prevRest ?? 0}, cool down from sold: {curDayData.prevSold ?? '-inf'}) = <strong className="text-cyan-400">${curDayData.rest}</strong></div>
              <div>• HOLD: max(stay holding: {curDayData.prevHold ?? -prices[0]}, buy today: {curDayData.prevRest ?? 0} - {prices[day]}) = <strong className="text-amber-400">${curDayData.hold}</strong></div>
              <div>• SOLD: hold + sell at {prices[day]} = <strong className="text-rose-400">{curDayData.sold === -Infinity ? '-inf' : `$${curDayData.sold}`}</strong></div>
            </div>
          </div>
        </div>

        {/* Right Code & Law (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">State Machine Synchronized Code</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                  O(N) Time · O(1) Space
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Day {day} (Price: ${prices[day]})
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div className={`py-0.5 rounded ${day === 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : 'text-slate-500'}`}>
                rest, hold, sold = 0, -prices[0], -float('inf')
              </div>
              <div className="text-slate-500">for p in prices[1:]:</div>
              <div className={`pl-4 py-0.5 rounded ${day > 0 ? 'bg-cyan-950/70 border-l-2 border-cyan-400 text-cyan-200 font-bold' : 'text-slate-400'}`}>
                new_rest = max(rest, sold)  # ${curDayData.rest}
              </div>
              <div className={`pl-4 py-0.5 rounded ${day > 0 ? 'bg-amber-950/70 border-l-2 border-amber-400 text-amber-200 font-bold' : 'text-slate-400'}`}>
                new_hold = max(hold, rest - p)  # ${curDayData.hold}
              </div>
              <div className={`pl-4 py-0.5 rounded ${day > 0 ? 'bg-rose-950/70 border-l-2 border-rose-400 text-rose-200 font-bold' : 'text-slate-400'}`}>
                new_sold = hold + p  # {curDayData.sold === -Infinity ? '-∞' : `$${curDayData.sold}`}
              </div>
              <div className="pl-4 text-slate-500">rest, hold, sold = new_rest, new_hold, new_sold</div>
              <div className={`py-0.5 rounded ${day === prices.length - 1 ? 'bg-emerald-950/70 border-l-2 border-emerald-400 text-emerald-200 font-bold' : 'text-slate-500'}`}>
                return max(rest, sold)  # Final Profit: ${Math.max(curDayData.rest, curDayData.sold)}
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-sans text-xs text-slate-300">
            <strong className="text-rose-400 block mb-1">Modus's Sacred Rule:</strong>
            "The cooldown is not an <code className="text-white">if</code>. It is a <strong>MISSING ARROW</strong>. You cannot transition from SOLD to HOLD. Constraints live in the graph, not guard clauses!"
          </div>
        </div>
      </div>
    </div>
  );
}
