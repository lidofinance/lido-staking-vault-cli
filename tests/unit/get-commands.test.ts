import { describe, test, expect } from '@jest/globals';
import { Command } from 'commander';

import { getCommandsJson } from '../../utils/get-commands.js';

describe('getCommandsJson', () => {
  test('returns JSON description of commands', () => {
    const program = new Command();
    program
      .command('run')
      .alias('r')
      .description('Run command')
      .argument('<file>');
    const json = getCommandsJson(program);
    const arr = JSON.parse(json);
    expect(arr).toEqual([
      { Command: 'run r\\<file>', Description: 'Run command' },
    ]);
  });
});
