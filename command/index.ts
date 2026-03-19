import { Command } from 'commander';

import { version } from 'version/index.js';

export const program = new Command();

program.version(version, '--version', 'output the current version');
program.option(
  '--populate-tx',
  'output raw transaction data instead of sending',
);
program.option(
  '-y, --yes',
  'automatically confirm prompts and proceed without asking',
);
program.option(
  '--no-cache-use',
  'do not use cache for fetching data from IPFS',
);
program.option('--wallet-connect', 'use wallet connect to send transactions');
program.option('--csv <file>', 'write table output to CSV file');
program.option('--json', 'output result in JSON format');

program.addHelpText('afterAll', () => {
  return `
Common options:
  --populate-tx          output raw transaction data instead of sending
  -y, --yes              automatically confirm prompts and proceed without asking
  --no-cache-use         do not use cache for fetching data from IPFS
  --wallet-connect       use wallet connect to send transactions
  --csv <file>           write table output to CSV file
  --json                 output result in JSON format
  `;
});
