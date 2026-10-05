import { useEffect, useState } from 'react';

export function useAutoplay({ playing, step, last, speed, setSpeed, onStep, onStop }) {
  useEffect(() => {
    if (!playing) return;
    if (step >= last) { onStop(false); return; }
    const timer = setTimeout(() => onStep(step + 1), speed);
    return () => clearTimeout(timer);
  }, [playing, step, last, speed, onStep, onStop]);
  const seek = next => { onStop(false); onStep(Math.max(0, Math.min(last, next))); };
  const toggle = () => { if (step >= last) onStep(0); onStop(value => !value); };
  return { step, playing, speed, setSpeed, seek, toggle };
}

export function usePlayback(length, initial = 0) {
  const [step, setStep] = useState(Math.min(initial, Math.max(0, length - 1)));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  return useAutoplay({ playing, step, last: length - 1, speed, setSpeed, onStep: setStep, onStop: setPlaying });
}
