import logUpdate from 'log-update';

import { readFileSync } from 'fs';
import path from 'path';

type SpinnerType =
  | 'dots'
  | 'dots12'
  | 'dotsCircle'
  | 'line'
  | 'arrow3'
  | 'bouncingBar'
  | 'bouncingBall'
  | 'point';

type args = {
  type?: SpinnerType;
  message?: string;
};

export const showSpinner = (args?: args) => {
  const { type = 'point', message = 'Executing...' } = args || {};

  // For nestjs/nextjs compatibility
  const fullPath = path.resolve('utils', 'spinner', 'spinners.json');
  const spinners = JSON.parse(readFileSync(fullPath, 'utf-8')) as Record<
    SpinnerType,
    { interval: number; frames: string[] }
  >;

  const spinner = spinners[type || 'point'];
  let index = 0;

  const interval = setInterval(() => {
    const { frames } = spinner;
    logUpdate(frames[(index = ++index % frames.length)] + ` ${message}`);
  }, spinner.interval);

  return () => {
    clearInterval(interval);
    logUpdate.clear();
  };
};
