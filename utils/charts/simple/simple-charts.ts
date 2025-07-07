import { Address, formatEther } from 'viem';
import { getDashboardContract } from 'contracts';
import {
  logError,
  logInfo,
  callReadMethodSilent,
  getVaultReportHistory,
  cache,
  getGrossStakingAPR,
  getGrossStakingRewards,
  getNetStakingAPR,
  getCarrySpread,
  getBottomLine,
  getRebaseRewardFromCache,
} from 'utils';

import {
  logGrossStakingAPRChart,
  logNetStakingAPRChart,
  logCarrySpreadChart,
  logBottomLineChart,
} from '../metrics.js';

// TODO: Refactor this file

const formatTimestamp = function (ts: number): string {
  const d = new Date(ts * 1000);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Render simple charts for APR metrics
export const renderSimpleCharts = async ({
  dashboard,
  cid,
  limit = 20,
  cacheUse = true,
}: {
  dashboard: Address;
  cid: string;
  limit?: number;
  cacheUse?: boolean;
}) => {
  const dashboardContract = getDashboardContract(dashboard);
  const vault = await callReadMethodSilent(dashboardContract, 'stakingVault');

  logInfo(
    `\n=== Getting report history for vault ${vault} (CID: ${cid}) ===\n`,
  );
  let history;
  try {
    history = await getVaultReportHistory(
      {
        vault,
        cid,
        limit,
        direction: 'asc',
      },
      cacheUse,
    );
  } catch (e) {
    logError('Error getting report history:', e);
    process.exit(1);
  }
  if (!history || history.length < 2) {
    logError('Not enough data for plotting (at least 2 reports needed)');
    process.exit(1);
  }

  // Calculate metrics for each pair (current, previous)
  const grossStakingAPRPercent = [];
  const netStakingAPRPercent = [];
  const carrySpreadPercent = [];
  const bottomLine = [];
  // TODO: log chart
  // eslint-disable-next-line sonarjs/no-unused-collection
  const grossStakingRewards = [];
  const timeLabels = [];

  // Get nodeOperatorFeeBP for each report block with caching
  const nodeOperatorFeeBPs: bigint[] = [];
  for (const r of history) {
    let fee = await cache.getNodeOperatorFeeRate(vault, r.blockNumber);
    if (fee === null) {
      fee = await callReadMethodSilent(
        dashboardContract,
        'nodeOperatorFeeRate',
        {
          blockNumber: BigInt(r.blockNumber),
        },
      );
      await cache.setNodeOperatorFeeRate(vault, r.blockNumber, fee);
    }
    nodeOperatorFeeBPs.push(fee);
  }

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];

    if (!current || !previous) continue;

    const stEthLiabilityRebaseRewards = await getRebaseRewardFromCache({
      vaultAddress: vault,
      blockNumberCurr: current.blockNumber,
      blockNumberPrev: previous.blockNumber,
      liabilitySharesCurr: BigInt(current.data.liabilityShares),
      liabilitySharesPrev: BigInt(previous.data.liabilityShares),
    });

    grossStakingRewards.push(
      Number(formatEther(getGrossStakingRewards(current, previous), 'gwei')),
    );
    grossStakingAPRPercent.push(
      getGrossStakingAPR(current, previous).apr_percent,
    );
    netStakingAPRPercent.push(
      getNetStakingAPR(current, previous, nodeOperatorFeeBPs[i] ?? 0n)
        .apr_percent,
    );
    carrySpreadPercent.push(
      getCarrySpread(
        current,
        previous,
        nodeOperatorFeeBPs[i] ?? 0n,
        stEthLiabilityRebaseRewards,
      ).apr_percent,
    );
    bottomLine.push(
      Number(
        getBottomLine(
          current,
          previous,
          nodeOperatorFeeBPs[i] ?? 0n,
          stEthLiabilityRebaseRewards,
        ),
      ),
    );

    timeLabels.push(formatTimestamp(current.timestamp));
  }

  logGrossStakingAPRChart(grossStakingAPRPercent, timeLabels);
  logInfo('\n');
  logNetStakingAPRChart(netStakingAPRPercent, timeLabels);
  logInfo('\n');
  logCarrySpreadChart(carrySpreadPercent, timeLabels);
  logInfo('\n');
  logBottomLineChart(bottomLine, timeLabels);
  logInfo('\n');
};
