import process from 'process';

import { logError, logInfo } from './logging/console.js';
import { disconnectWalletConnect } from './wallet-connect.js';

type ActionHandler = (...args: any[]) => Promise<any>;

export const withInterruptHandling = (action: ActionHandler) => {
  return async (...args: any[]) => {
    let interrupted = false;

    const sigintHandler = async () => {
      interrupted = true;
      await disconnectWalletConnect();
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
      if (err instanceof Error) logError('Command failed:', err.message);
      else logError('Command failed:', err);

      await disconnectWalletConnect();
      process.exit(1);
    } finally {
      process.off('SIGINT', sigintHandler);
    }
  };
};
