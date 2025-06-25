import { Address } from 'viem';
import { Option } from 'commander';

import { DashboardAbi } from 'abi';
import {
  getDashboardBaseInfo,
  getDashboardRoles,
  getDashboardHealth,
  getDashboardOverview,
} from 'features';
import { getDashboardContract, getVaultHubContract } from 'contracts';
import {
  generateReadCommands,
  logResult,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  getConfirmationsInfo,
} from 'utils';

import { dashboard } from './main.js';
import { readCommandConfig } from './config.js';

const dashboardRead = dashboard
  .command('read')
  .alias('r')
  .description('read commands');

dashboardRead.addOption(new Option('-cmd2json'));
dashboardRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardRead));
  process.exit();
});

dashboardRead
  .command('info')
  .description('get dashboard base info')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await getDashboardBaseInfo(contract);
  });

dashboardRead
  .command('overview')
  .description('get dashboard overview')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getDashboardOverview(contract);
  });

dashboardRead
  .command('roles')
  .description('get dashboard roles')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getDashboardRoles(contract);
  });

dashboardRead
  .command('health')
  .description('get vault health info')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getDashboardHealth(contract);
  });

dashboardRead
  .command('dashboard-address-by-vault')
  .alias('dashboard-by-vault')
  .description('get dashboard address by vault')
  .argument('<vault>', 'vault address', stringToAddress)
  .action(async (vault: Address) => {
    const vaultHub = await getVaultHubContract();
    const vaultConnection = await callReadMethodSilent(
      vaultHub,
      'vaultConnection',
      [vault],
    );
    logResult({
      data: [['Dashboard Address', vaultConnection.owner]],
    });
  });

dashboardRead
  .command('confirmations-log')
  .description('get pending confirmations')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getConfirmationsInfo(contract as any);
  });

generateReadCommands(
  DashboardAbi,
  getDashboardContract,
  dashboardRead,
  readCommandConfig,
);
