import { program } from 'command';

export const printError = (err: unknown, message: string) => {
  if (err instanceof Error) {
    program.error(`${message}:\n ${err.message}`, { exitCode: 1 });
  }
};
