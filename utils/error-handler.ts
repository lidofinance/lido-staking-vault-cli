import { logError } from './logging/console.js';

export const printError = (err: unknown, message: string) => {
  logError(message);
  throw err;
};
