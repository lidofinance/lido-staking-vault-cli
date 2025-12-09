import { callReadMethodSilent, cache } from 'utils';
import { DashboardContract } from 'contracts';

export const getNodeOperatorFeeRatesByBlockNumbers = async (
  vaultAddress: string,
  blockNumbers: number[],
  dashboardContract: DashboardContract,
) => {
  // Get nodeOperatorFeeBP for each report block with caching
  const nodeOperatorFeeBPs: bigint[] = [];
  for (const blockNumber of blockNumbers) {
    let fee = await cache.getNodeOperatorFeeRate(vaultAddress, blockNumber);
    if (fee === null) {
      const feeRate = await callReadMethodSilent(dashboardContract, 'feeRate', {
        blockNumber: BigInt(blockNumber),
      });
      fee = BigInt(feeRate);
      await cache.setNodeOperatorFeeRate(vaultAddress, blockNumber, fee);
    }

    nodeOperatorFeeBPs.push(fee);
  }

  return nodeOperatorFeeBPs;
};

export const getSettledGrowthsByBlockNumbers = async (
  vaultAddress: string,
  blockNumbers: number[],
  dashboardContract: DashboardContract,
) => {
  // Get settled growth for each report block with caching
  const settledGrowths: bigint[] = [];
  for (const blockNumber of blockNumbers) {
    let settledGrowth = await cache.getSettledGrowth(vaultAddress, blockNumber);
    if (settledGrowth === null) {
      settledGrowth = await callReadMethodSilent(
        dashboardContract,
        'settledGrowth',
        {
          blockNumber: BigInt(blockNumber),
        },
      );
      await cache.setSettledGrowth(vaultAddress, blockNumber, settledGrowth);
    }

    settledGrowths.push(settledGrowth);
  }

  return settledGrowths;
};
