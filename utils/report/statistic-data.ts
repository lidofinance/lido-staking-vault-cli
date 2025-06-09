import { Address } from 'viem';

import { getDashboardContract } from 'contracts';
import {
  calculateRebaseReward,
  callReadMethodSilent,
  calculateShareRate,
} from 'utils';

import { VaultReport } from './report.js';
import { reportMetrics } from './report-statistic.js';

type StatisticDataArgs = {
  dashboard: Address;
  reports: { current: VaultReport; previous: VaultReport };
};

export const getReportStatisticData = async (args: StatisticDataArgs) => {
  const { dashboard, reports } = args;
  const dashboardContract = getDashboardContract(dashboard);
  const reportRefBlockNumber = reports.current.blockNumber;
  const reportPrevBlockNumber = reports.previous.blockNumber;

  const nodeOperatorFeeBP = await callReadMethodSilent(
    dashboardContract,
    'nodeOperatorFeeBP',
    {
      blockNumber: BigInt(reportRefBlockNumber),
    },
  );
  const [shareRatePrev, shareRateCurr] = await Promise.all([
    calculateShareRate(reportPrevBlockNumber),
    calculateShareRate(reportRefBlockNumber),
  ]);

  const stEthLiabilityRebaseRewards = calculateRebaseReward({
    shareRatePrev,
    shareRateCurr,
    sharesPrev: BigInt(reports.previous.data.liability_shares),
    sharesCurr: BigInt(reports.current.data.liability_shares),
  });

  const metrics = reportMetrics({
    reports: { current: reports.current, previous: reports.previous },
    nodeOperatorFeeBP,
    stEthLiabilityRebaseRewards,
  });

  return metrics;
};
