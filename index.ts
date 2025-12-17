#! /usr/bin/env node

import { getChain } from 'configs';

import { program } from './command/index.js';
import { logError, logInfo } from './utils/logging/console.js';
import { withInterruptHandling } from './utils/interrupt-handler.js';
import './programs/index.js';
import { disconnectWalletConnect } from './utils/index.js';

export * from './utils/index.js';

const showTestnetWarning = () => {
  console.info('\n🎉🎉  HOODI V3 is officially launched!  🎉🎉');
  console.info(
    '🌐 Web UI is available at: https://stvaults-hoodi.testnet.fi/vaults',
  );
  console.info(
    '📄 Contracts info: https://docs.lido.fi/deployed-contracts/hoodi',
  );
  console.info(
    '📖 stVaults Doc Center: https://docs.lido.fi/run-on-lido/stvaults',
  );
  console.info('\n');
  console.info('🔄 Testnet-1 is available on the testnet-1 branch.');
  console.info('🔄 Testnet-2 is available on the testnet-2 branch.');
};

program.addHelpText('afterAll', () => {
  showTestnetWarning();
  return '';
});

// Add interrupt handling to the CLI
const runCLI = withInterruptHandling(async () => {
  const chain = await getChain();
  logInfo(`${'-'.repeat(100)}`);
  logInfo(`Using chain: Name: ${chain.name}, Chain ID: ${chain.id}`);
  logInfo(`${'-'.repeat(100)}`);
  await program.parseAsync(process.argv);
});

runCLI()
  .catch(async (error) => {
    logError('CLI Error:', error.message);
    await disconnectWalletConnect();
    process.exit(1);
  })
  .finally(async () => {
    showTestnetWarning();
    await disconnectWalletConnect();
    process.exit(0);
  });
