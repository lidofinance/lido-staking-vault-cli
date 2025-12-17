import { Address } from 'viem';
import { Option } from 'commander';

import { getDashboardFactoryContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmOperation,
  logInfo,
  getCommandsJson,
  stringToAddress,
} from 'utils';

import { dashboardFactory } from './main.js';

const dashboardFactoryWrite = dashboardFactory
  .command('write')
  .alias('w')
  .description('dashboard factory write commands');

dashboardFactoryWrite.addOption(new Option('-cmd2json'));
dashboardFactoryWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardFactoryWrite));
  process.exit();
});

dashboardFactoryWrite
  .command('create-dashboard')
  .alias('c-d')
  .description('create Dashboard contract by StakingVault')
  .argument('<stakingVault>', 'staking vault address', stringToAddress)
  .argument('<defaultAdmin>', 'default admin address', stringToAddress)
  .action(async (stakingVault: Address, defaultAdmin: Address) => {
    const contract = await getDashboardFactoryContract();

    const confirm = await confirmOperation(
      `Are you sure you want to create dashboard for the staking vault ${stakingVault} with default admin is ${defaultAdmin}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'createDashboard',
      payload: [stakingVault, defaultAdmin],
    });
  });
