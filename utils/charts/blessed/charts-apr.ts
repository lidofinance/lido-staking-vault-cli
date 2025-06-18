import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { Address } from 'viem';

import { callReadMethodSilent, cache, getVaultReportHistory } from 'utils';
import { getDashboardContract } from 'contracts';

import { lineOpts, getMinMax } from './utils.js';
import { LIMIT } from './constants.js';
import {
  prepareEfficiency,
  prepareBottomLine,
  prepareGrossStakingAPR,
  prepareLidoAPR,
  prepareNetStakingAPR,
  buildLidoAPRChart,
  buildNetStakingAPRChart,
  buildEfficiencyChart,
  buildBottomLineChart,
  buildGrossStakingAPRChart,
} from './datasets/index.js';

type FetchAprChartsDataArgs = {
  cid: string;
  dashboard: Address;
  limit?: number;
  cacheUse?: boolean;
};

export const fetchAprChartsData = async ({
  cid,
  dashboard,
  limit = LIMIT,
  cacheUse = true,
}: FetchAprChartsDataArgs) => {
  const dashboardContract = getDashboardContract(dashboard);
  const vault = await callReadMethodSilent(dashboardContract, 'stakingVault');
  const history = await getVaultReportHistory(
    {
      vault,
      cid,
      limit,
      direction: 'asc',
    },
    cacheUse,
  );
  if (!history || history.length < 2) throw new Error('Not enough data');

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

  const grossStakingAPR = await prepareGrossStakingAPR(history);
  const netStakingAPR = await prepareNetStakingAPR(history, nodeOperatorFeeBPs);
  const efficiency = await prepareEfficiency(
    history,
    nodeOperatorFeeBPs,
    vault,
  );
  const bottomLine = await prepareBottomLine(
    history,
    nodeOperatorFeeBPs,
    vault,
  );
  const lidoAPR = await prepareLidoAPR(history);

  const grossStakingAPRChart = buildGrossStakingAPRChart(grossStakingAPR);
  const netStakingAPRChart = buildNetStakingAPRChart(netStakingAPR);
  const efficiencyChart = buildEfficiencyChart(efficiency);
  const bottomLineChart = buildBottomLineChart(bottomLine);
  const lidoAPRChart = buildLidoAPRChart(lidoAPR);

  return {
    grossStakingAPRChart,
    netStakingAPRChart,
    efficiencyChart,
    bottomLineChart,
    lidoAPRChart,
  };
};

export const renderAprCharts = ({
  grossStakingAPRChart,
  netStakingAPRChart,
  efficiencyChart,
  bottomLineChart,
  lidoAPRChart,
}: any) => {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Vault Metrics Charts',
  });
  const grid = new contrib.grid({ rows: 3, cols: 2, screen });

  const charts = [
    grid.set(
      0,
      0,
      1,
      1,
      contrib.line,
      lineOpts({
        title: grossStakingAPRChart.dataset.title,
        label: grossStakingAPRChart.dataset.label,
        yLabel: grossStakingAPRChart.dataset.yLabel,
        range: grossStakingAPRChart.range,
      }),
    ),
    grid.set(
      0,
      1,
      1,
      1,
      contrib.line,
      lineOpts({
        title: netStakingAPRChart.dataset.title,
        label: netStakingAPRChart.dataset.label,
        yLabel: netStakingAPRChart.dataset.yLabel,
        range: netStakingAPRChart.range,
      }),
    ),
    grid.set(
      1,
      0,
      1,
      1,
      contrib.line,
      lineOpts({
        title: efficiencyChart.dataset.title,
        label: efficiencyChart.dataset.label,
        yLabel: efficiencyChart.dataset.yLabel,
        range: efficiencyChart.range,
      }),
    ),
    grid.set(
      1,
      1,
      1,
      1,
      contrib.line,
      lineOpts({
        title: bottomLineChart.dataset.title,
        label: bottomLineChart.dataset.label,
        yLabel: bottomLineChart.dataset.yLabel,
        range: bottomLineChart.range,
      }),
    ),
    grid.set(
      2,
      0,
      1,
      1,
      contrib.line,
      lineOpts({
        title: lidoAPRChart.dataset.title,
        label: lidoAPRChart.dataset.label,
        yLabel: lidoAPRChart.dataset.yLabel,
        range: lidoAPRChart.range,
      }),
    ),
    grid.set(
      2,
      1,
      1,
      1,
      contrib.line,
      lineOpts({
        title: lidoAPRChart.dataset.title,
        label: lidoAPRChart.dataset.label,
        yLabel: lidoAPRChart.dataset.yLabel,
        range: getMinMax([
          ...netStakingAPRChart.dataset.y,
          ...lidoAPRChart.dataset.y,
        ]),
      }),
    ),
  ];

  const datasets = [
    grossStakingAPRChart.dataset,
    netStakingAPRChart.dataset,
    efficiencyChart.dataset,
    bottomLineChart.dataset,
    lidoAPRChart.dataset,
    [netStakingAPRChart.dataset, lidoAPRChart.dataset],
  ];

  charts.forEach((chart, i) => {
    if (chart.type === 'stackedBar' || chart.type === 'bar') {
      chart.setData(datasets[i]);
    } else if (Array.isArray(datasets[i])) {
      chart.setData(datasets[i]);
    } else {
      chart.setData([datasets[i]]);
    }
  });
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  screen.render();
};
