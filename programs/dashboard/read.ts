import { Address, formatEther } from 'viem';
import { Option } from 'commander';

import { DashboardAbi } from 'abi';
import { getBaseInfo, getRoles } from 'features';
import { getDashboardContract } from 'contracts';
import {
  fetchAndCalculateVaultHealth,
  generateReadCommands,
  logResult,
  logInfo,
  getCommandsJson,
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
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await getBaseInfo(contract);
  });

dashboardRead
  .command('roles')
  .description('get dashboard roles')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getRoles(contract);
  });

dashboardRead
  .command('health')
  .description('get vault health info')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const {
        healthRatio,
        isHealthy,
        totalValue,
        liabilitySharesInStethWei,
        forceRebalanceThresholdBP,
        liabilityShares,
      } = await fetchAndCalculateVaultHealth(contract);

      logResult({
        'Vault Healthy': isHealthy,
        'Total Value, wei': totalValue,
        'Total Value, ether': `${formatEther(totalValue)} ETH`,
        'Liability Shares': `${liabilityShares} shares`,
        'Liability Shares in stETH': `${formatEther(liabilitySharesInStethWei)} stETH`,
        'Rebalance Threshold, BP': forceRebalanceThresholdBP,
        'Rebalance Threshold, %': `${forceRebalanceThresholdBP / 100}%`,
        'Health Rate': `${healthRatio}%`,
      });
    } catch (err) {
      if (err instanceof Error) {
        logInfo('Error when getting info:\n', err.message);
      }
    }
  });

generateReadCommands(
  DashboardAbi,
  getDashboardContract,
  dashboardRead,
  readCommandConfig,
);
