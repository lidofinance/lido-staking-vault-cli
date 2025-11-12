import { Hex } from 'viem';
import { Option } from 'commander';

import { VaultViewerAbi } from 'abi';
import { getAccount } from 'providers';
import {
  getVaultsByAddress,
  getVaultsByRoleMember,
  getAllVaults,
} from 'features';
import { getVaultViewerContract } from 'contracts';
import {
  generateReadCommands,
  logTable,
  getCommandsJson,
  logInfo,
  stringToHex,
} from 'utils';

import { vaultViewer } from './main.js';
import { readCommandConfig } from './config.js';

export const vaultViewerRead = vaultViewer
  .command('read')
  .alias('r')
  .description('read commands');

vaultViewerRead.addOption(new Option('-cmd2json'));
vaultViewerRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultViewerRead));
  process.exit();
});

generateReadCommands(
  VaultViewerAbi,
  getVaultViewerContract,
  vaultViewerRead,
  readCommandConfig,
);

vaultViewerRead
  .command('my')
  .description('get all my vaults')
  .option('-s, --simple', 'simple output')
  .action(async ({ simple }: { simple: boolean }) => {
    const account = await getAccount();

    const vaults = await getVaultsByAddress(account.address);

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: Object.entries(vaults).map(([vault, roles]) => [
        vault,
        roles.join(', '),
      ]),
      params: {
        head: ['Vault Address', 'Roles'],
      },
    });
  });

vaultViewerRead
  .command('my-by-role')
  .description('get all vaults where I have a role')
  .argument('<role>', 'role', stringToHex)
  .option('-s, --simple', 'simple output')
  .action(async (role: Hex, { simple }: { simple: boolean }) => {
    const account = await getAccount();

    const vaults = await getVaultsByRoleMember(role, account.address);

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: vaults.map((vault: string) => [vault]),
      params: {
        head: ['Vault Address'],
      },
    });
  });

vaultViewerRead
  .command('all')
  .description('get all vaults connected to vault hub')
  .option('-s, --simple', 'simple output')
  .action(async ({ simple }: { simple: boolean }) => {
    const vaults = await getAllVaults();

    if (simple) {
      console.info(vaults);
      return;
    }

    logTable({
      data: vaults.map((vault: string) => [vault]),
      params: {
        head: ['Vault Address'],
      },
    });
    logInfo(`Total vaults: ${vaults.length}`);
  });
