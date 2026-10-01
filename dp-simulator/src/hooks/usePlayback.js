import { useEffect, useState } from 'react';

export function useAutoplay({ playing, step, last, speed, onStep, onStop }) {
  useEffect(() => {
    if (!playing) return;
    if (step >= last) { onStop(false); return; }
    const timer = setTimeout(() => onStep(step + 1), speed);
    return () => clearTimeout(timer);
  }, [playing, step, last, speed, onStep, onStop]);
}

export function usePlayback(length, initial = 0) {
  const [step, setStep] = useState(Math.min(initial, Math.max(0, length - 1)));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  useEffect(() => {
    if (!playing) return;
    if (step >= length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setStep(s => Math.min(length - 1, s + 1)), speed);
    return () => clearTimeout(timer);
  }, [playing, speed, step, length]);
  const seek = next => { setPlaying(false); setStep(Math.max(0, Math.min(length - 1, next))); };
  return { step, playing, speed, seek, setSpeed, toggle: () => { if (step >= length - 1) setStep(0); setPlaying(p => !p); } };
}
