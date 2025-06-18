#! /usr/bin/env node

import { program } from './command/index.js';
import { logError } from './utils/logging/console.js';
import './programs/index.js';

export * from './utils/index.js';

const showTestnetWarning = () => {
  console.info(
    '\n⚠️  Heads-up! All Testnet data will not be available via Web UI on 25 Jun 2025 as part of migration to the stVaults',
  );
  console.info(
    '🔄 Testnet-1 CLI functionality will remain available in the testnet-1 branch.',
  );
  console.info(
    '📄 Contracts info: https://docs.lido.fi/deployed-contracts/hoodi-lidov3/\n',
  );
};

program.addHelpText('afterAll', () => {
  showTestnetWarning();
  return '';
});

program
  .parseAsync(process.argv)
  .catch((error) => {
    logError('CLI Error:', error.message);
    process.exit(1);
  })
  .finally(() => {
    showTestnetWarning();
  });
