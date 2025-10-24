import { Option } from 'commander';

import { getVaultFactoryContract } from 'contracts';
import { VaultFactoryAbi } from 'abi';
import { generateReadCommands, getCommandsJson, logInfo } from 'utils';
import { getVaultFactoryInfo } from 'features';

import { vaultFactory } from './main.js';
import { readCommandConfig } from './config.js';

const vaultFactoryRead = vaultFactory
  .command('read')
  .aliases(['r'])
  .description('vault factory read commands');

vaultFactoryRead.addOption(new Option('-cmd2json'));
vaultFactoryRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultFactoryRead));
  process.exit();
});

vaultFactoryRead
  .command('info')
  .description('get vault factory info')
  .action(async () => {
    await getVaultFactoryInfo();
  });

generateReadCommands(
  VaultFactoryAbi,
  getVaultFactoryContract,
  vaultFactoryRead,
  readCommandConfig,
);
