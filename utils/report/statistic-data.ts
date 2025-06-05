import { callReadMethodSilent } from 'utils/contract.js';
import { VaultReport } from './report.js';
import { getDashboardContract, getStethContract } from 'contracts';
import { Address } from 'viem';

import { reportMetrics } from './report-statistic.js';

type StatisticDataArgs = {
  dashboard: Address;
  reports: { current: VaultReport; previous: VaultReport };
};

export const getReportStatisticData = async (args: StatisticDataArgs) => {
  const { dashboard, reports } = args;
  const dashboardContract = getDashboardContract(dashboard);
  const stEthContract = await getStethContract();
  const reportRefBlockNumber = reports.current.blockNumber;

  const nodeOperatorFeeBP = await callReadMethodSilent(
    dashboardContract,
    'nodeOperatorFeeBP',
  );
  const [totalSupplyPrev, getTotalSharesPrev] = await Promise.all([
    callReadMethodSilent(stEthContract, 'totalSupply', {
      blockNumber: BigInt(reportRefBlockNumber - 10),
    }),
    callReadMethodSilent(stEthContract, 'getTotalShares', {
      blockNumber: BigInt(reportRefBlockNumber - 1),
    }),
  ]);
  const [totalSupplyCurr, getTotalSharesCurr] = await Promise.all([
    callReadMethodSilent(stEthContract, 'totalSupply', {
      blockNumber: BigInt(reportRefBlockNumber),
    }),
    callReadMethodSilent(stEthContract, 'getTotalShares', {
      blockNumber: BigInt(reportRefBlockNumber),
    }),
  ]);
  const shareRatePrev = (totalSupplyPrev * 10n ** 27n) / getTotalSharesPrev;
  const shareRateCurr = (totalSupplyCurr * 10n ** 27n) / getTotalSharesCurr;

  const stEthLiabilityRebaseRewards =
    shareRatePrev * BigInt(reports.previous.data.liability_shares) -
    shareRateCurr * BigInt(reports.current.data.liability_shares);

  const metrics = reportMetrics({
    reports: { current: reports.current, previous: reports.previous },
    nodeOperatorFeeBP,
    stEthLiabilityRebaseRewards,
  });

  return metrics;
};
