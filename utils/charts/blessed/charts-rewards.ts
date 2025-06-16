import blessed from 'blessed';
import contrib from 'blessed-contrib';

import { Address } from 'viem';
import { callReadMethodSilent, cache, getVaultReportHistory } from 'utils';
import { getDashboardContract } from 'contracts';

import { lineOpts } from './utils.js';
import { LIMIT } from './constants.js';
import {
  prepareNetStakingRewards,
  prepareNodeOperatorRewards,
  prepareGrossStakingRewards,
  buildNetStakingRewardsChart,
  buildNodeOperatorRewardsChart,
  buildGrossStakingRewardsChart,
} from './datasets/index.js';

type FetchRewardsChartsDataArgs = {
  cid: string;
  dashboard: Address;
  limit?: number;
  cacheUse?: boolean;
};

export const fetchRewardsChartsData = async ({
  cid,
  dashboard,
  limit = LIMIT,
  cacheUse = true,
}: FetchRewardsChartsDataArgs) => {
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

  const grossStakingRewards = await prepareGrossStakingRewards(history);
  const nodeOperatorRewards = await prepareNodeOperatorRewards(
    history,
    nodeOperatorFeeBPs,
  );
  const netStakingRewards = await prepareNetStakingRewards(
    history,
    nodeOperatorFeeBPs,
  );

  const grossStakingRewardsChart =
    buildGrossStakingRewardsChart(grossStakingRewards);
  const nodeOperatorRewardsChart =
    buildNodeOperatorRewardsChart(nodeOperatorRewards);
  const netStakingRewardsChart = buildNetStakingRewardsChart(netStakingRewards);

  return {
    grossStakingRewardsChart,
    nodeOperatorRewardsChart,
    netStakingRewardsChart,
  };
};

export const renderRewardsCharts = ({
  grossStakingRewardsChart,
  nodeOperatorRewardsChart,
  netStakingRewardsChart,
}: any) => {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Vault Metrics Charts',
  });
  const grid = new contrib.grid({ rows: 2, cols: 2, screen });

  const charts = [
    grid.set(
      0,
      0,
      1,
      1,
      contrib.line,
      lineOpts({
        title: grossStakingRewardsChart.dataset.title,
        label: grossStakingRewardsChart.dataset.label,
        yLabel: grossStakingRewardsChart.dataset.yLabel,
        range: grossStakingRewardsChart.range,
      }),
    ),
    grid.set(
      0,
      1,
      1,
      1,
      contrib.line,
      lineOpts({
        title: nodeOperatorRewardsChart.dataset.title,
        label: nodeOperatorRewardsChart.dataset.label,
        yLabel: nodeOperatorRewardsChart.dataset.yLabel,
        range: nodeOperatorRewardsChart.range,
      }),
    ),
    grid.set(
      1,
      0,
      1,
      1,
      contrib.line,
      lineOpts({
        title: netStakingRewardsChart.dataset.title,
        label: netStakingRewardsChart.dataset.label,
        yLabel: netStakingRewardsChart.dataset.yLabel,
        range: netStakingRewardsChart.range,
      }),
    ),
    // grid.set(4, 1, 1, 1, contrib.stackedBar, {
    //   label: 'Stacked Rewards',
    //   barWidth: 4,
    //   barSpacing: 6,
    //   xOffset: 0,
    //   height: '100%',
    //   width: '50%',
    //   barBgColor: ['red', 'green'],
    // }),
  ];

  // const rewardsBarChart = {
  //   barCategory: grossStakingRewardsChart.bar.data.barCategory,
  //   stackedCategory: ['Node Operator', 'Gross'],
  //   data: grossStakingRewardsChart.bar.data.y.map((y: number, i: number) => [
  //     nodeOperatorRewardsChart.bar.data.y[i],
  //     y,
  //   ]),
  // };

  const datasets = [
    grossStakingRewardsChart.dataset,
    nodeOperatorRewardsChart.dataset,
    netStakingRewardsChart.dataset,
    // rewardsBarChart,
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
