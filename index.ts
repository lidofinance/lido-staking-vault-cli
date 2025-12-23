#! /usr/bin/env node

import { getChain } from 'configs';
import { mainnet } from 'viem/chains';

import { program } from './command/index.js';
import { logError, logInfo } from './utils/logging/console.js';
import { withInterruptHandling } from './utils/interrupt-handler.js';
import './programs/index.js';
import { disconnectWalletConnect } from './utils/index.js';

export * from './utils/index.js';

const showTestnetWarning = () => {
  console.info('\nHOODI V3 application:');
  console.info('- 🌐 Web UI: https://stvaults-hoodi.testnet.fi/vaults');
  console.info(
    '- 📄 Contracts info: https://docs.lido.fi/deployed-contracts/hoodi',
  );
  console.info(
    '- 📖 stVaults Doc Center: https://docs.lido.fi/run-on-lido/stvaults',
  );
  console.info('\n🔄 Testnet-1 is available on the testnet-1 branch.');
  console.info('🔄 Testnet-2 is available on the testnet-2 branch.');
};

const showMainnetWarning = () => {
  console.info('\nMainnet V3 application:');
  console.info('- 🌐 Web UI: https://stvaults.lido.fi/vaults');
  console.info('- 📄 Contracts info: https://docs.lido.fi/deployed-contracts');
  console.info(
    '- 📖 stVaults Doc Center: https://docs.lido.fi/run-on-lido/stvaults',
  );
};

program.addHelpText('afterAll', () => {
  const chain = process.env.CHAIN_ID;
  if (chain === String(mainnet.id)) {
    showMainnetWarning();
  } else {
    showTestnetWarning();
  }
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
    const chain = await getChain();

    if (chain.id === mainnet.id) {
      showMainnetWarning();
    } else {
      showTestnetWarning();
    }

    await disconnectWalletConnect();
    process.exit(0);
  });
