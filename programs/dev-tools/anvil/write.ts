import { spawn } from 'node:child_process';
import { logInfo, logError } from 'utils';

import { anvil } from './main.js';
import { getChain } from 'configs';

anvil
  .command('start')
  .description('start Anvil node with optional parameters')
  .argument('<forkUrl>', 'Fork from a remote Ethereum node')
  .option('-p, --port <number>', 'Port number to listen on', '8545')
  .option('-a, --accounts <number>', 'Number of dev accounts', '10')
  .option(
    '-b, --block-time <number>',
    'Block time in seconds (0 = auto mining on tx)',
  )
  .option('--fork-block-number <number>', 'Fork from a specific block number')
  .option('--chain-id <number>', 'Chain ID')
  .option('--gas-limit <number>', 'Block gas limit')
  .option('--gas-price <number>', 'Gas price in gwei')
  .option('--mnemonic <string>', 'BIP39 mnemonic phrase')
  .option('--derivation-path <string>', 'Derivation path for accounts')
  .option('-s, --state <path>', 'Load state from file')
  .option('--state-interval <number>', 'Interval for state snapshots')
  .option('--dump-state <path>', 'Dump state to file on exit')
  .option('--silent', 'No output except errors')
  .option('--steps-tracing', 'Enable step tracing')
  .option('--no-mining', 'Disable automatic mining')
  .action(async (forkUrl, options) => {
    const chainId = await getChain();

    const args: string[] = [
      '--port',
      options.port,
      '--accounts',
      options.accounts,
      '--chain-id',
      options.chainId ?? chainId.id,
    ];

    // Block time
    if (options.blockTime) {
      args.push('--block-time', options.blockTime);
    }

    // Fork URL
    if (forkUrl) {
      args.push('--fork-url', forkUrl);
    }

    // Fork block number
    if (options.forkBlockNumber) {
      args.push('--fork-block-number', options.forkBlockNumber);
    }

    // Gas limit
    if (options.gasLimit) {
      args.push('--gas-limit', options.gasLimit);
    }

    // Gas price
    if (options.gasPrice) {
      args.push('--gas-price', options.gasPrice);
    }

    // Mnemonic
    if (options.mnemonic) {
      args.push('--mnemonic', options.mnemonic);
    }

    // Derivation path
    if (options.derivationPath) {
      args.push('--derivation-path', options.derivationPath);
    }

    // Load state
    if (options.state) {
      args.push('--state', options.state);
    }

    // State interval
    if (options.stateInterval) {
      args.push('--state-interval', options.stateInterval);
    }

    // Dump state
    if (options.dumpState) {
      args.push('--dump-state', options.dumpState);
    }

    // Silent mode
    if (options.silent) {
      args.push('--silent');
    }

    // Steps tracing
    if (options.stepsTracing) {
      args.push('--steps-tracing');
    }

    // No mining
    if (options.noMining) {
      args.push('--no-mining');
    }

    logInfo('Starting Anvil with the following parameters:');
    logInfo(`Command: anvil ${args.join(' ')}`);
    logInfo('');

    // eslint-disable-next-line sonarjs/no-os-command-from-path -- anvil binary is a known dev tool
    const anvilProcess = spawn('anvil', args, {
      stdio: 'inherit',
    });

    logInfo(
      `Use url http://127.0.0.1:${options.port} to connect to Anvil. For CLI set ENV VAR EL_URL=http://127.0.0.1:${options.port}`,
    );

    anvilProcess.on('error', (error) => {
      logError(`Failed to start Anvil: ${error.message}`);
      logError('Make sure Foundry is installed: https://book.getfoundry.sh/');
      process.exit(1);
    });

    anvilProcess.on('exit', (code, signal) => {
      if (code !== null) {
        if (code === 0) {
          logInfo('Anvil stopped successfully');
        } else {
          logError(`Anvil exited with code ${code}`);
        }
      } else if (signal) {
        logInfo(`Anvil was killed with signal ${signal}`);
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logInfo('\nShutting down Anvil...');
      anvilProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      logInfo('\nShutting down Anvil...');
      anvilProcess.kill('SIGTERM');
    });
  });
