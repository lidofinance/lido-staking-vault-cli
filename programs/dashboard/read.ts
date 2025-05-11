import { Address, formatEther } from 'viem';
import { Option } from 'commander';

import { DashboardAbi } from 'abi';
import {
  getDashboardBaseInfo,
  getDashboardRoles,
  getDashboardHealth,
  getDashboardOverview,
} from 'features';
import { getDashboardContract, getStakingVaultContract } from 'contracts';
import {
  generateReadCommands,
  logResult,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethod,
  getRequiredLockByShares,
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
  .command('locked')
  .description('get locked info')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');
    const vaultContract = getStakingVaultContract(vault);

    await callReadMethod(vaultContract, 'locked');
  });

dashboardRead
  .command('required-lock-by-shares')
  .alias('req-lock')
  .description('get required lock by shares')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<newShares>', 'new shares')
  .action(async (address: Address, newShares: string) => {
    const { requiredLock, currentLock } = await getRequiredLockByShares(
      address,
      newShares,
    );

    logResult({
      'Required Lock (wei)': requiredLock,
      'Required Lock (shares)': formatEther(requiredLock),
      'Current Lock (wei)': currentLock,
      'Current Lock (shares)': formatEther(currentLock),
    });
  });

dashboardRead
  .command('dashboard-address-by-vault')
  .alias('dashboard-by-vault')
  .description('get dashboard address by vault')
  .argument('<vault>', 'vault address', stringToAddress)
  .action(async (vault: Address) => {
    const contract = getStakingVaultContract(vault);
    const owner = await callReadMethodSilent(contract, 'owner');
    logResult({
      'Dashboard Address': owner,
    });
  });

dashboardRead
  .command('confirmations-log')
  .description('get pending confirmations')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    await getConfirmationsInfo(address);
  });

generateReadCommands(
  DashboardAbi,
  getDashboardContract,
  dashboardRead,
  readCommandConfig,
);
