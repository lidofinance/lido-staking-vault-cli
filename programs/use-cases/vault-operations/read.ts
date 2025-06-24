import { Option } from 'commander';

import { getCommandsJson, logInfo } from 'utils';

import { vaultOperations } from './main.js';
import { Address } from 'viem';
import {
  getVaultHealthByDashboard,
  chooseVaultAndGetDashboard,
  getVaultInfoByDashboard,
  getVaultOverviewByDashboard,
  getVaultRolesByDashboard,
} from 'features';

const vaultOperationsRead = vaultOperations
  .command('read')
  .aliases(['r'])
  .description('vault operations read commands');

vaultOperationsRead.addOption(new Option('-cmd2json'));
vaultOperationsRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultOperationsRead));
  process.exit();
});

vaultOperationsRead
  .command('info')
  .description('get vault info')
  .option('-v, --vault <string>', 'vault address')
  .action(async ({ vault }: { vault: Address }) => {
    const { contract } = await chooseVaultAndGetDashboard(vault);

    await getVaultInfoByDashboard(contract);
  });

vaultOperationsRead
  .command('health')
  .description('get vault health')
  .option('-v, --vault <string>', 'vault address')
  .action(async ({ vault }: { vault: Address }) => {
    const { contract } = await chooseVaultAndGetDashboard(vault);

    await getVaultHealthByDashboard(contract);
  });

vaultOperationsRead
  .command('overview')
  .description('get vault overview')
  .option('-v, --vault <string>', 'vault address')
  .action(async ({ vault }: { vault: Address }) => {
    const { contract } = await chooseVaultAndGetDashboard(vault);

    await getVaultOverviewByDashboard(contract);
  });

vaultOperationsRead
  .command('roles')
  .description('get vault roles')
  .option('-v, --vault <string>', 'vault address')
  .action(async ({ vault }: { vault: Address }) => {
    const { contract } = await chooseVaultAndGetDashboard(vault);

    await getVaultRolesByDashboard(contract);
  });
