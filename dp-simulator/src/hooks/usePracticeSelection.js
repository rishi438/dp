import { readStored, useStoredState } from './useStoredState';

export function usePracticeSelection(chapter, choices) {
  const legacy = readStored(`simulation.${chapter}`, readStored(`challenge.${chapter}`, choices[0].id));
  const [selected, setSelected] = useStoredState(`practice.${chapter}`, legacy);
  return [choices.find(problem => problem.id === selected) || choices[0], setSelected];
}
