import React from 'react';
import TraceExplorer from '../TraceExplorer';
import { getPractice } from '../../data/practice';

export default function DigitDPSimulator({ input = { n: 100 } }) {
  return <TraceExplorer problem={getPractice('digit-no4')} input={input} memoized />;
}
