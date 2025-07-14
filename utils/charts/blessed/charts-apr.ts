import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { Address } from 'viem';

import { callReadMethodSilent, cache, getVaultReportHistory } from 'utils';
import { getDashboardContract } from 'contracts';

import { lineOpts, getMinMax } from './utils.js';
import { LIMIT } from './constants.js';
import {
  prepareCarrySpread,
  prepareBottomLine,
  prepareGrossStakingAPR,
  prepareLidoAPR,
  prepareNetStakingAPR,
  buildLidoAPRChart,
  buildNetStakingAPRChart,
  buildCarrySpreadChart,
  buildBottomLineChart,
  buildGrossStakingAPRChart,
} from './datasets/index.js';

type FetchAprChartsDataArgs = {
  cid: string;
  dashboard: Address;
  limit?: number;
  cacheUse?: boolean;
};

// Reports rework - adding inOutDelta
const MIN_REPORT_TIMESTAMP = 1750699020;

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
      minTimestamp: MIN_REPORT_TIMESTAMP,
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

  const grossStakingAPR = prepareGrossStakingAPR(history);
  const netStakingAPR = prepareNetStakingAPR(history, nodeOperatorFeeBPs);
  const carrySpread = await prepareCarrySpread(
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
  const carrySpreadChart = buildCarrySpreadChart(carrySpread);
  const bottomLineChart = buildBottomLineChart(bottomLine);
  const lidoAPRChart = buildLidoAPRChart(lidoAPR);

  return {
    grossStakingAPRChart,
    netStakingAPRChart,
    carrySpreadChart,
    bottomLineChart,
    lidoAPRChart,
  };
};

export const renderAprCharts = ({
  grossStakingAPRChart,
  netStakingAPRChart,
  carrySpreadChart,
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
        title: carrySpreadChart.dataset.title,
        label: carrySpreadChart.dataset.label,
        yLabel: carrySpreadChart.dataset.yLabel,
        range: carrySpreadChart.range,
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
    carrySpreadChart.dataset,
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
