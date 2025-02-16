import { Command } from 'commander';

import { version } from 'version/index.js';

export const program = new Command();

program.version(version, '-v, --version', 'output the current version');
