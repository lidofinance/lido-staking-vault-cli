import { callReadMethodSilent, cache } from 'utils';
import {
  calcAccruedFeeOffChain,
  NOFeeSnapshot,
} from 'utils/statistic/report-statistic.js';
import { VaultReport } from 'utils/report/types.js';
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
      const feeRate = await callReadMethodSilent({
        contract: dashboardContract,
        methodName: 'feeRate',
        payload: [
          {
            blockNumber: BigInt(blockNumber),
          },
        ],
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
      settledGrowth = await callReadMethodSilent({
        contract: dashboardContract,
        methodName: 'settledGrowth',
        payload: [
          {
            blockNumber: BigInt(blockNumber),
          },
        ],
      });
      await cache.setSettledGrowth(vaultAddress, blockNumber, settledGrowth);
    }

    settledGrowths.push(settledGrowth);
  }

  return settledGrowths;
};

export const getNodeOperatorAccruedFeeByBlockNumbers = async (
  vaultAddress: string,
  blockNumbers: number[],
  dashboardContract: DashboardContract,
) => {
  // Get node operator accrued fee for each report block with caching
  const nodeOperatorAccruedFees: bigint[] = [];
  for (const blockNumber of blockNumbers) {
    let nodeOperatorAccruedFee = await cache.getNodeOperatorAccruedFee(
      vaultAddress,
      blockNumber,
    );
    if (nodeOperatorAccruedFee === null) {
      nodeOperatorAccruedFee = await callReadMethodSilent({
        contract: dashboardContract,
        methodName: 'accruedFee',
        payload: [
          {
            blockNumber: BigInt(blockNumber),
          },
        ],
      });
      await cache.setNodeOperatorAccruedFee(
        vaultAddress,
        blockNumber,
        nodeOperatorAccruedFee,
      );
    }

    nodeOperatorAccruedFees.push(nodeOperatorAccruedFee);
  }

  return nodeOperatorAccruedFees;
};

// Builds NOFeeSnapshot[] aligned with `history` (one snapshot per report).
// accruedFee is computed off-chain from IPFS data so it is correct even when
// the vault owner hasn't called updateVaultData for the latest report.
// quarantineValue is treated as 0 (option A: rare event, timing unreliable).
export const getNOFeeSnapshotsByBlockNumbers = async (
  vaultAddress: string,
  blockNumbers: number[],
  dashboardContract: DashboardContract,
  history: VaultReport[],
): Promise<NOFeeSnapshot[]> => {
  const [settledGrowths, feeRates] = await Promise.all([
    getSettledGrowthsByBlockNumbers(
      vaultAddress,
      blockNumbers,
      dashboardContract,
    ),
    getNodeOperatorFeeRatesByBlockNumbers(
      vaultAddress,
      blockNumbers,
      dashboardContract,
    ),
  ]);

  return blockNumbers.map((_, i) => {
    const report = history[i];
    const settledGrowth = settledGrowths[i] ?? 0n;
    const feeRate = feeRates[i] ?? 0n;

    const accruedFee = report
      ? calcAccruedFeeOffChain({
          totalValueWei: BigInt(report.data.totalValueWei),
          inOutDelta: BigInt(report.extraData.inOutDelta),
          settledGrowth,
          feeRate,
        })
      : 0n;

    return { accruedFee, settledGrowth, feeRate };
  });
};
