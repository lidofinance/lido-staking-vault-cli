import { Address, formatEther } from 'viem';

import { DashboardAbi } from 'abi';
import { getBaseInfo } from 'features';
import { getDashboardContract, getStethContract } from 'contracts';
import {
  calculateHealthRatio,
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
    const stethContract = await getStethContract();

    try {
      const [valuation, minted, rebalanceThresholdBP] = await Promise.all([
        contract.read.valuation(), // BigInt, in wei
        contract.read.sharesMinted(), // BigInt, in shares
        contract.read.rebalanceThresholdBP(), // number (in basis points)
      ]);
      if (minted === 0n) {
        logInfo('Minted is 0');
        return;
      }

      const mintedInSteth = await stethContract.read.getPooledEthByShares([
        minted,
      ]); // BigInt

      const { healthRatioNumber, isHealthy } = calculateHealthRatio(
        valuation,
        mintedInSteth,
        rebalanceThresholdBP,
      );

      logResult({
        'Vault Healthy': isHealthy,
        'Valuation, wei': valuation,
        'Valuation, ether': `${formatEther(valuation)} ETH`,
        'Minted, stETH': `${mintedInSteth} stETH`,
        'Rebalance Threshold, BP': rebalanceThresholdBP,
        'Rebalance Threshold, %': `${rebalanceThresholdBP / 100}%`,
        'Health Rate': `${healthRatioNumber}%`,
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
