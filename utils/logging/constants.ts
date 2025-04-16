import chalk from 'chalk';

export type HeadMessage = 'Error' | 'LOG' | 'Result' | 'Bold';

const ConsoleCss = {
  Error: chalk.red.bold,
  LOG: chalk.blue.bold,
  Result: chalk.green.bold,
  Bold: chalk.bold,
};

export const getColoredLog = <T>(type: HeadMessage, message: T) => {
  return ConsoleCss[type](message);
};
