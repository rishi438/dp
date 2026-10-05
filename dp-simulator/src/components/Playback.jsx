import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Playback({ playback, length, compact = false }) {
  const { step, seek, playing, toggle, speed, setSpeed } = playback;
  const playLabel = playing ? 'Pause' : step === length - 1 ? 'Replay' : 'Play';
  return <div className={`playback ${compact ? 'floating-playback' : ''}`} aria-label="Simulation playback">
    <button onClick={() => seek(0)} aria-label="Reset simulation" title="Reset simulation">{compact ? <RotateCcw size={16} /> : 'Reset'}</button>
    <button onClick={() => seek(step - 1)} disabled={step === 0} aria-label="Previous step" title="Previous step">{compact ? <ChevronLeft size={18} /> : '←'}</button>
    <button className={compact ? 'play-toggle primary-button' : undefined} onClick={toggle} aria-label={playLabel} title={playLabel}>{compact ? playing ? <Pause size={18} /> : <Play size={18} /> : playLabel}</button>
    <button onClick={() => seek(step + 1)} disabled={step === length - 1} aria-label="Next step" title="Next step">{compact ? <ChevronRight size={18} /> : '→'}</button>
    <label className="playback-seek">Step <input aria-label="Simulation step" type="range" min="0" max={Math.max(0, length - 1)} value={step} onChange={e => seek(Number(e.target.value))} /></label>
    <span className="playback-count">{step + 1} / {length}</span>
    <label className="playback-pace">Pace <select aria-label="Playback speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
      <option value="1800">Slow</option><option value="900">Normal</option><option value="300">Fast</option>
    </select></label>
  </div>;
}
