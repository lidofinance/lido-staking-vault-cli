import process from 'process';

import { logError, logInfo } from './logging/console.js';

type ActionHandler = (...args: any[]) => Promise<any>;

export const withInterruptHandling = (action: ActionHandler) => {
  return async (...args: any[]) => {
    let interrupted = false;

    const sigintHandler = () => {
      interrupted = true;
      logInfo('\n✋ Interrupted. Exiting...');
      process.exit(130);
    };

    process.once('SIGINT', sigintHandler);

    try {
      const result = await action(...args);

      if (interrupted) {
        logInfo('Aborted after SIGINT');
      }

      return result;
    } catch (err) {
      logError('Command failed:', err);
      process.exit(1);
    } finally {
      process.off('SIGINT', sigintHandler);
    }
  };
};
