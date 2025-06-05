import { Address } from 'viem';
import { getDashboardContract, getStethContract } from 'contracts';
import {
  logError,
  logInfo,
  callReadMethodSilent,
  reportMetrics,
  getVaultReportHistory,
} from 'utils';

import {
  logGrossStakingAPRChart,
  logNetStakingAPRChart,
  logEfficiencyChart,
  logBottomLineChart,
} from '../metrics.js';

// TODO: Refactor this file

const formatTimestamp = function (ts: number): string {
  const d = new Date(ts * 1000);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const renderSimpleCharts = async (
  dashboard: Address,
  cid: string,
  limit = 20,
) => {
  const dashboardContract = getDashboardContract(dashboard);
  const vault = await callReadMethodSilent(dashboardContract, 'stakingVault');

  logInfo(
    `\n=== Getting report history for vault ${vault} (CID: ${cid}) ===\n`,
  );
  let history;
  try {
    history = await getVaultReportHistory({ vault, cid, limit });
  } catch (e) {
    logError('Error getting report history:', e);
    process.exit(1);
  }
  if (!history || history.length < 2) {
    logError('Not enough data for plotting (at least 2 reports needed)');
    process.exit(1);
  }

  // Получаем контракты
  const stEthContract = await getStethContract();

  // Считаем метрики для каждой пары (current, previous)
  const grossStakingAPR = [];
  const netStakingAPR = [];
  const efficiency = [];
  const bottomLine = [];
  const timeLabels = [];
  for (let i = history.length - 1; i > 0; i--) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;
    // Получаем nodeOperatorFeeBP на момент current.blockNumber
    let nodeOperatorFeeBP = 0n;
    try {
      nodeOperatorFeeBP = await callReadMethodSilent(
        dashboardContract,
        'nodeOperatorFeeBP',
      );
    } catch (e) {
      logError('Error getting nodeOperatorFeeBP:', e);
    }
    // Получаем totalSupply и getTotalShares для расчета shareRate
    let totalSupplyPrev = 1n,
      getTotalSharesPrev = 1n,
      totalSupplyCurr = 1n,
      getTotalSharesCurr = 1n;
    try {
      [totalSupplyPrev, getTotalSharesPrev] = await Promise.all([
        callReadMethodSilent(stEthContract, 'totalSupply', {
          blockNumber: BigInt(current.blockNumber - 10),
        }),
        callReadMethodSilent(stEthContract, 'getTotalShares', {
          blockNumber: BigInt(current.blockNumber - 1),
        }),
      ]);
      [totalSupplyCurr, getTotalSharesCurr] = await Promise.all([
        callReadMethodSilent(stEthContract, 'totalSupply', {
          blockNumber: BigInt(current.blockNumber),
        }),
        callReadMethodSilent(stEthContract, 'getTotalShares', {
          blockNumber: BigInt(current.blockNumber),
        }),
      ]);
    } catch (e) {
      logError('Error getting stETH data:', e);
    }
    const shareRatePrev =
      getTotalSharesPrev !== 0n
        ? (totalSupplyPrev * 10n ** 27n) / getTotalSharesPrev
        : 0n;
    const shareRateCurr =
      getTotalSharesCurr !== 0n
        ? (totalSupplyCurr * 10n ** 27n) / getTotalSharesCurr
        : 0n;
    const stEthLiabilityRebaseRewards =
      shareRatePrev * BigInt(previous.data.liability_shares) -
      shareRateCurr * BigInt(current.data.liability_shares);

    const metrics = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP,
      stEthLiabilityRebaseRewards,
    });
    grossStakingAPR.push(metrics.grossStakingAPR_percent);
    netStakingAPR.push(metrics.netStakingAPR_percent);
    efficiency.push(metrics.efficiency_percent);
    bottomLine.push(Number(metrics.bottomLine) / 1e18); // ETH
    timeLabels.push(formatTimestamp(current.timestamp));
  }

  logGrossStakingAPRChart(grossStakingAPR, timeLabels);
  logInfo('\n');
  logNetStakingAPRChart(netStakingAPR, timeLabels);
  logInfo('\n');
  logEfficiencyChart(efficiency, timeLabels);
  logInfo('\n');
  logBottomLineChart(bottomLine, timeLabels);
  logInfo('\n');
};
