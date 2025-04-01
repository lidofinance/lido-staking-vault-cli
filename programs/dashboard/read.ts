import { getDashboardContract, getStethContract } from 'contracts';
import { Address, formatEther } from 'viem';
import { DashboardAbi } from 'abi';
import { calculateHealthRatio, generateReadCommands, textPrompt } from 'utils';
import { getBaseInfo } from 'features';

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
        console.info('Command cancelled');
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
      if (minted === BigInt(0)) {
        console.info('Minted is 0');
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

      console.table({
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
        console.info('Error when getting info:\n', err.message);
      }
    }
  });

generateReadCommands(
  DashboardAbi,
  getDashboardContract,
  dashboard,
  readCommandConfig,
);
