import { Address, formatEther } from 'viem';

import { DashboardAbi } from 'abi';
import { getBaseInfo } from 'features';
import { getDashboardContract } from 'contracts';
import {
  fetchAndCalculateVaultHealth,
  generateReadCommands,
  textPrompt,
  logResult,
  logInfo,
} from 'utils';

import { dashboard } from './main.js';
import { readCommandConfig } from './config.js';

dashboard
  .command('info')
  .description('get dashboard base info')
  .option('-a, --address <address>', 'dashboard address')
  .action(async ({ address }: { address: Address }) => {
    let dashboardAddress = address;

    if (!dashboardAddress) {
      const answer = await textPrompt('Enter dashboard address', 'address');
      dashboardAddress = answer.address;

      if (!dashboardAddress) {
        logInfo('Command cancelled');
        return;
      }
    }

    const contract = getDashboardContract(dashboardAddress);

    await getBaseInfo(contract);
  });

dashboard
  .command('health')
  .description('get vault health info')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const {
        healthRatio,
        isHealthy,
        valuation,
        mintedInStethWei,
        rebalanceThresholdBP,
        minted,
      } = await fetchAndCalculateVaultHealth(contract);

      logResult({
        'Vault Healthy': isHealthy,
        'Valuation, wei': valuation,
        'Valuation, ether': `${formatEther(valuation)} ETH`,
        'Minted, shares': `${minted} shares`,
        'Minted, stETH': `${formatEther(mintedInStethWei)} stETH`,
        'Rebalance Threshold, BP': rebalanceThresholdBP,
        'Rebalance Threshold, %': `${rebalanceThresholdBP / 100}%`,
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
  dashboard,
  readCommandConfig,
);
