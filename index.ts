#! /usr/bin/env node

import { program } from './command/index.js';
import { logError } from './utils/logging/console.js';
import './programs/index.js';

export * from './utils/index.js';

const showTestnetWarning = () => {
  console.info(
    '\n⚠️  Heads-up! All Testnet data will be erased on 23 Jun 2025 as a part of the Web UI migration to the stVaults Testnet-2 contracts. Back up anything important.',
  );
  console.info(
    '🔄 Testnet-1 CLI functionality will remain available in the testnet-1 branch.',
  );
  console.info(
    '📄 Contracts info: https://docs.lido.fi/deployed-contracts/hoodi-lidov3/\n',
  );
};

program
  .parseAsync(process.argv)
  .then(() => {
    showTestnetWarning();
  })
  .catch((error) => {
    logError('CLI Error:', error.message);
    process.exit(1);
  });
