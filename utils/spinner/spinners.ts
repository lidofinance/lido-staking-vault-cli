import logUpdate from 'log-update';

import spinners from './spinners.json' with { type: 'json' };

export const showSpinner = () => {
  const spinner = spinners.point;
  let index = 0;

  const interval = setInterval(() => {
    const { frames } = spinner;
    logUpdate(frames[(index = ++index % frames.length)] + ' Executing...');
  }, spinner.interval);

  return () => {
    clearInterval(interval);
    logUpdate.clear();
  };
};
