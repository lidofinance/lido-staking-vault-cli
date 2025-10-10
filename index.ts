#! /usr/bin/env node

import { program } from './command/index.js';
import { logError } from './utils/logging/console.js';
import './programs/index.js';

export * from './utils/index.js';

const showTestnetWarning = () => {
  console.info('\n⚠️ 🎉🎉  HOODI V3 is officially launched!  🎉🎉 ⚠️');
  // console.info(
  //   '🌐 Web UI is updated and available at: https://vaults-hoodi-lidov3.testnet.fi/vaults',
  // );
  console.info('🔄 Testnet-1 is available on the testnet-1 branch.');
  console.info('🔄 Testnet-2 is available on the testnet-2 branch.');
  console.info('🔄 Testnet-3 is available on the testnet-3 branch.');
  // console.info(
  //   '📄 Contracts info: https://docs.lido.fi/deployed-contracts/hoodi-lidov3/\n',
  // );
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
