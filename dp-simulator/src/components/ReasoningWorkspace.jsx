import React from 'react';
import { simulationPractices } from '../data/staircase';
import { usePracticeSelection } from '../hooks/usePracticeSelection';
import ReasoningGate from './ReasoningGate';

export default function ReasoningWorkspace({ chapterNum, onGoToTree, onGoToSimulation, onGoToCode }) {
  const choices = simulationPractices(chapterNum);
  const [problem, setSelected] = usePracticeSelection(chapterNum, choices);
  const nextTarget = onGoToTree || onGoToSimulation;
  return <div className="space-y-4">
    <div className="workspace-toolbar"><label>Exercise <select aria-label="Reasoning exercise" value={problem.id} onChange={event => setSelected(event.target.value)}>{choices.map(choice => <option key={choice.id} value={choice.id}>{choice.title}</option>)}</select></label><span>Think → review → simulate → code</span></div>
    <ReasoningGate key={problem.id} problem={problem}><div className="panel reasoning-actions"><button className="primary-button" onClick={nextTarget}>Next: Recursion Tree vs Memo</button>{onGoToSimulation && onGoToTree && <button onClick={onGoToSimulation}>Simulation</button>}{problem.id !== 'gold-stairs' && <button onClick={onGoToCode}>Write code</button>}</div></ReasoningGate>
  </div>;
}
