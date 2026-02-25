import { logError } from './logging/console.js';

export const printError = (err: unknown, message: string) => {
  logError(message);
  if (err instanceof Error && err.message) {
    logError(err.message);
  }
  throw err;
};
