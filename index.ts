#! /usr/bin/env node

import { getChain } from 'configs';
import { mainnet } from 'viem/chains';

import { program } from './command/index.js';
import { logError, logInfo } from './utils/logging/console.js';
import { withInterruptHandling } from './utils/interrupt-handler.js';
import './programs/index.js';
import {
  closeJsonLogging,
  disconnectWalletConnect,
  logJson,
  openJsonLogging,
} from './utils/index.js';

export * from './utils/index.js';

const showTestnetWarning = () => {
  console.info('\nHOODI V3 application:');
  console.info(
    '- 📖 CLI Docs: https://lidofinance.github.io/lido-staking-vault-cli/',
  );
  console.info('- 🌐 Web UI: https://stvaults-hoodi.testnet.fi/vaults');
  console.info(
    '- 📄 Contracts info: https://docs.lido.fi/deployed-contracts/hoodi',
  );
  console.info(
    '- 📖 stVaults Doc Center: https://docs.lido.fi/run-on-lido/stvaults\n',
  );
};

const showMainnetWarning = () => {
  const now = new Date();
  const targetDate = new Date('2026-01-29');
  const shouldShowLinks = now >= targetDate;

  console.info('\nMainnet V3 application:');
  console.info(
    '- 📖 CLI Docs: https://lidofinance.github.io/lido-staking-vault-cli/',
  );
  if (shouldShowLinks) {
    console.info('- 🌐 Web UI: https://stvaults.lido.fi/vaults');
  }
  console.info('- 📄 Contracts info: https://docs.lido.fi/deployed-contracts');
  console.info(
    '- 📖 stVaults Doc Center: https://docs.lido.fi/run-on-lido/stvaults\n',
  );
};

program.addHelpText('afterAll', () => {
  const chain = process.env.CHAIN_ID;
  if (program.opts().json) return '';
  if (chain === String(mainnet.id)) {
    showMainnetWarning();
  } else {
    showTestnetWarning();
  }
  return '';
});

// Add interrupt handling to the CLI
const runCLI = withInterruptHandling(async () => {
  // programm.opts is not init yet
  const isJson = process.argv.includes('--json');
  const chain = await getChain();
  if (isJson) {
    openJsonLogging();
  } else {
    logInfo(`${'-'.repeat(100)}`);
    logInfo(`Using chain: Name: ${chain.name}, Chain ID: ${chain.id}`);
    logInfo(`${'-'.repeat(100)}`);
  }
  await program.parseAsync(process.argv);
});

runCLI()
  .catch(async (error) => {
    await disconnectWalletConnect().catch();
    if (program.opts().json) {
      logJson({ error: error.message });
      closeJsonLogging();
    } else {
      logError('CLI Error:', error.message);
    }
    process.exit(1);
  })
  .finally(async () => {
    if (program.opts().json) {
      closeJsonLogging();
    } else {
      const chain = await getChain();
      if (chain.id === mainnet.id) {
        showMainnetWarning();
      } else {
        showTestnetWarning();
      }
    }

    await disconnectWalletConnect();

    // If the command is not charts, exit
    // It is necessary to keep the screen open for charts
    const isCharts = ['charts', 'charts-apr', 'charts-rewards', 'metrics'].some(
      (command) => process.argv.includes(command),
    );
    if (!isCharts) process.exit(0);
  });
