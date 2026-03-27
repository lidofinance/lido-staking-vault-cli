import { logUpdateStderr } from 'log-update';

import { spinners, SpinnerType } from './constants.js';

type args = {
  type?: SpinnerType;
  message?: string;
};

export const showSpinner = (args?: args) => {
  if (process.argv.includes('--json')) return () => {};

  const { type = 'point', message = 'Executing...' } = args || {};

  const spinner = spinners[type || 'point'];
  let index = 0;

  const interval = setInterval(() => {
    const { frames } = spinner;
    index = ++index % frames.length;
    logUpdateStderr(frames[index] + ` ${message}`);
  }, spinner.interval);

  return () => {
    clearInterval(interval);
    logUpdateStderr.clear();
  };
};
