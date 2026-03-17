import { Address } from 'viem';

import { getDashboardContract } from 'contracts';
import {
  calculateRebaseReward,
  callReadMethodSilent,
  calculateShareRate,
  reportMetrics,
} from 'utils';
import {
  calcAccruedFeeOffChain,
  NOFeeSnapshot,
} from 'utils/statistic/report-statistic.js';

import type { VaultReport } from './types.js';

type StatisticDataArgs = {
  dashboard: Address;
  reports: { current: VaultReport; previous: VaultReport };
};

const fetchNOFeeSnapshot = async (
  report: VaultReport,
  dashboardContract: Awaited<ReturnType<typeof getDashboardContract>>,
): Promise<NOFeeSnapshot> => {
  const blockNumber = BigInt(report.blockNumber);

  const [settledGrowth, feeRate] = await Promise.all([
    callReadMethodSilent({
      contract: dashboardContract,
      methodName: 'settledGrowth',
      payload: [{ blockNumber }],
    }),
    callReadMethodSilent({
      contract: dashboardContract,
      methodName: 'feeRate',
      payload: [{ blockNumber }],
    }),
  ]);

  const feeRateBigInt = BigInt(feeRate);
  const accruedFee = calcAccruedFeeOffChain({
    totalValueWei: BigInt(report.data.totalValueWei),
    inOutDelta: BigInt(report.extraData.inOutDelta),
    settledGrowth,
    feeRate: feeRateBigInt,
  });

  return { accruedFee, settledGrowth, feeRate: feeRateBigInt };
};

export const getReportStatisticData = async (args: StatisticDataArgs) => {
  const { dashboard, reports } = args;
  const dashboardContract = await getDashboardContract(dashboard);

  const [noFeeCurr, noFeePrev, shareRatePrev, shareRateCurr] =
    await Promise.all([
      fetchNOFeeSnapshot(reports.current, dashboardContract),
      fetchNOFeeSnapshot(reports.previous, dashboardContract),
      calculateShareRate(reports.previous.blockNumber),
      calculateShareRate(reports.current.blockNumber),
    ]);

  const stEthLiabilityRebaseRewards = calculateRebaseReward({
    shareRatePrev,
    shareRateCurr,
    sharesPrev: BigInt(reports.previous.data.liabilityShares),
  });

  const metrics = reportMetrics({
    reports: { current: reports.current, previous: reports.previous },
    noFeeCurr,
    noFeePrev,
    stEthLiabilityRebaseRewards,
  });

  return metrics;
};
