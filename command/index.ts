import { Command } from 'commander';

import { version } from 'version/index.js';

export const program = new Command();

program.version(version, '-v, --version', 'output the current version');
program.option(
  '--populate-tx',
  'output raw transaction data instead of sending',
);
program.option(
  '-y, --yes',
  'automatically confirm prompts and proceed without asking',
);
