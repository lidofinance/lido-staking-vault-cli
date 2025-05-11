import chalk from 'chalk';

const { red, blue, green, bold, yellow } = chalk;

export type HeadMessage = 'Error' | 'LOG' | 'Result' | 'Bold' | 'Cancel';

const ConsoleCss = {
  Error: red.bold,
  LOG: blue.bold,
  Result: green.bold,
  Bold: bold,
  Cancel: yellow.bold,
};

export const getColoredLog = <T>(type: HeadMessage, message: T) => {
  return ConsoleCss[type](message);
};
