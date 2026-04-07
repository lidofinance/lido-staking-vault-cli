import process from 'node:process';

import {
  closeJsonLogging,
  logError,
  logInfo,
  logJson,
} from './logging/console.js';
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
      await disconnectWalletConnect().catch(() => {});
      // programm.opts is not init
      const isJson = process.argv.includes('--json');
      if (isJson) {
        logJson({ error: err instanceof Error ? err.message : err });
        closeJsonLogging();
      } else {
        if (err instanceof Error) logError('Command failed:', err.message);
        else logError('Command failed:', err);
      }

      process.exit(1);
    } finally {
      process.off('SIGINT', sigintHandler);
    }
  };
};
