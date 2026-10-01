import { useCallback, useState } from 'react';

export function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(`dp.v2.${key}`);
    if (value === null) return fallback;
    const parsed = JSON.parse(value);
    return parsed !== null && typeof parsed === typeof fallback && Array.isArray(parsed) === Array.isArray(fallback) ? parsed : fallback;
  } catch { return fallback; /* Missing/corrupt storage must not prevent studying. */ }
}

export function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStored(key, fallback));
  const update = useCallback(next => {
    setValue(previous => {
      const result = typeof next === 'function' ? next(previous) : next;
      try { localStorage.setItem(`dp.v2.${key}`, JSON.stringify(result)); }
      catch { window.dispatchEvent(new Event('dp-storage-unavailable')); }
      return result;
    });
  }, [key]);
  return [value, update];
}
