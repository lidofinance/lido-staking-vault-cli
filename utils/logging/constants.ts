import chalk from 'chalk';
import type { TableConstructorOptions } from 'cli-table3';

const { red, blue, green, bold, yellow } = chalk;
export const TABLE_PARAMS: TableConstructorOptions = {
  head: ['Type', 'Value'],
  colAligns: ['left', 'right', 'right', 'right', 'right', 'right'],
  style: { head: ['gray'] },
};

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
