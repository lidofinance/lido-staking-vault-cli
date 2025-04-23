import { Address } from 'viem';
import { Option } from 'commander';

import { getVaultHubContract } from 'contracts';
import { getVaultHubBaseInfo, getVaultHubRoles } from 'features';
import {
  generateReadCommands,
  printError,
  callReadMethod,
  logResult,
  getCommandsJson,
  logInfo,
  stringToAddress,
} from 'utils';
import { VaultHubAbi } from 'abi';

import { vaultHub } from './main.js';
import { readCommandConfig } from './config.js';

const VaultHubRead = vaultHub
  .command('read')
  .aliases(['r'])
  .description('vault hub read commands');

VaultHubRead.addOption(new Option('-cmd2json'));
VaultHubRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(VaultHubRead));
  process.exit();
});

// Works fine
VaultHubRead.command('info')
  .description('get vault hub info')
  .action(async () => {
    await getVaultHubBaseInfo();
  });

VaultHubRead.command('roles')
  .description('get vault hub roles')
  .action(async () => {
    await getVaultHubRoles();
  });

generateReadCommands(
  VaultHubAbi,
  getVaultHubContract,
  VaultHubRead,
  readCommandConfig,
);

// // Works fine

VaultHubRead.command('vi')
  .description('get vault and vault socket by index')
  .argument('<index>', 'index')
  .action(async (index: string) => {
    const biIndex = BigInt(index);
    const contract = await getVaultHubContract();

    try {
      const vault = await callReadMethod(contract, 'vault', [biIndex]);
      const vaultSocket = await callReadMethod(contract, 'vaultSocket', [
        biIndex,
      ]);

      logResult({
        Vault: vault,
        'Vault Socket': vaultSocket,
      });
    } catch (err) {
      printError(err, 'Error when getting vault and vault socket');
    }
  });

VaultHubRead.command('rebalance-shortfall')
  .description(
    'estimate ether amount to make the vault healthy using rebalance',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    await callReadMethod(contract, 'rebalanceShortfall', [address]);
  });
