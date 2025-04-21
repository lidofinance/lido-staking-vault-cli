import { Address } from 'viem';
import { Option } from 'commander';

import { getStakingVaultContract } from 'contracts';
import { StakingVaultAbi } from 'abi';
import { getVaultBaseInfo } from 'features';
import { generateReadCommands, logInfo, getCommandsJson } from 'utils';

import { vault } from './main.js';
import { readCommandConfig } from './config.js';

const vaultRead = vault
  .command('read')
  .aliases(['r'])
  .description('vault read commands');

vaultRead.addOption(new Option('-cmd2json'));
vaultRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultRead));
  process.exit();
});

vaultRead
  .command('info')
  .description('get vault base info')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    await getVaultBaseInfo(address);
  });

generateReadCommands(
  StakingVaultAbi,
  getStakingVaultContract,
  vaultRead,
  readCommandConfig,
);
