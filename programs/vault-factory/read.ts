import { getVaultFactoryContract } from 'contracts';
import { VaultFactoryAbi } from 'abi';
import { generateReadCommands, logResult, logError } from 'utils';

import { vaultFactory } from './main.js';
import { readCommandConfig } from './config.js';

vaultFactory
  .command('constants')
  .description('get vault factory constants info')
  .action(async () => {
    const contract = getVaultFactoryContract();
    try {
      const beaconAddress = await contract.read.BEACON();
      const delegationImplAddress = await contract.read.DELEGATION_IMPL();

      logResult({
        beaconAddress,
        delegationImplAddress,
      });
    } catch (err) {
      if (err instanceof Error) {
        logError('Error when getting constants:\n', err.message);
      }
    }
  });

generateReadCommands(
  VaultFactoryAbi,
  getVaultFactoryContract,
  vaultFactory,
  readCommandConfig,
);
