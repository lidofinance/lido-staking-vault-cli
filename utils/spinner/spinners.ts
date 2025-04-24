import logUpdate from 'log-update';

import spinners from './spinners.json';

type args = {
  type?: keyof typeof spinners;
  message?: string;
};

export const showSpinner = (args?: args) => {
  const { type = 'point', message = 'Executing...' } = args || {};
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
