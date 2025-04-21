import { program } from 'command';

import { logError } from 'utils';

export const printError = (err: unknown, message: string) => {
  if (err instanceof Error) {
    logError(message);
    program.error(`${err.message}`, { exitCode: 1 });
  } else {
    logError(message);
    program.error(`${err}`, { exitCode: 1 });
  }
};
