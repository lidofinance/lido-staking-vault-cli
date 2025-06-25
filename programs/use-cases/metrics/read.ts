import { formatEther } from 'viem';
import { Option } from 'commander';
import { program } from 'command';

import { getLazyOracleContract } from 'contracts';
import {
  logInfo,
  getCommandsJson,
  getVaultReport,
  callReadMethod,
  getReportStatisticData,
  getVaultPreviousReport,
  fetchAndVerifyFile,
  logResult,
  formatRatio,
  fetchAprChartsData,
  renderAprCharts,
  fetchRewardsChartsData,
  renderRewardsCharts,
  stringToNumber,
  renderSimpleCharts,
} from 'utils';
import { chooseVaultAndGetDashboard } from 'features/vault-operations/dashboard-by-vault.js';

import { metrics } from './main.js';

const metricsRead = metrics
  .command('read')
  .alias('r')
  .description('read commands');

metricsRead.addOption(new Option('-cmd2json'));
metricsRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(metricsRead));
  process.exit();
});

metricsRead
  .command('statistic')
  .description('get statistic data for last report')
  .option('-v, --vault <string>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async ({ vault, gateway }) => {
    const { address: dashboardAddress, vault: vaultAddress } =
      await chooseVaultAndGetDashboard({ vault });
    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);

    const { cacheUse } = program.opts();
    const reportCurrent = await getVaultReport(
      {
        vault: vaultAddress,
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
    );
    const reportPrevious = await getVaultPreviousReport(
      {
        vault: vaultAddress,
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
    );
    const statisticData = await getReportStatisticData({
      dashboard: dashboardAddress,
      reports: { current: reportCurrent, previous: reportPrevious },
    });

    logResult({
      data: [
        [
          'Gross Staking Rewards, ETH',
          formatEther(statisticData.grossStakingRewards),
        ],
        [
          'Node Operator Rewards, ETH',
          formatEther(statisticData.nodeOperatorRewards),
        ],
        ['Daily Lido Fees, ETH', formatEther(statisticData.dailyLidoFees)],
        [
          'Net Staking Rewards, ETH',
          formatEther(statisticData.netStakingRewards),
        ],
        [
          'Gross Staking APR, %',
          formatRatio(statisticData.grossStakingAPR.apr_percent),
        ],
        [
          'Net Staking APR, %',
          formatRatio(statisticData.netStakingAPR.apr_percent),
        ],
        ['Efficiency, %', formatRatio(statisticData.efficiency.apr_percent)],
        ['Bottom Line, ETH', formatEther(statisticData.bottomLine)],
      ],
    });
  });

metricsRead
  .command('charts-apr')
  .description('get APR charts data for N last reports')
  .argument('<count>', 'count of reports', stringToNumber)
  .option('-v, --vault <string>', 'vault address')
  .option('-s, --simplified', 'simplified charts')
  .action(async (count: number, { vault, simplified }) => {
    const { address: dashboardAddress } = await chooseVaultAndGetDashboard({
      vault,
    });
    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');
    const { cacheUse } = program.opts();

    if (simplified) {
      await renderSimpleCharts({
        dashboard: dashboardAddress,
        cid: vaultsDataReportCid,
        limit: count,
        cacheUse,
      });
    } else {
      const chartsData = await fetchAprChartsData({
        cid: vaultsDataReportCid,
        dashboard: dashboardAddress,
        limit: count,
        cacheUse,
      });
      renderAprCharts(chartsData);
    }
  });

metricsRead
  .command('charts-rewards')
  .description('get APR charts data for N last reports')
  .argument('<count>', 'count of reports', stringToNumber)
  .option('-v, --vault <string>', 'vault address')
  .action(async (count: number, { vault }) => {
    const { address: dashboardAddress } = await chooseVaultAndGetDashboard({
      vault,
    });
    const lazyOracleContract = await getLazyOracleContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(lazyOracleContract, 'latestReportData');

    const { cacheUse } = program.opts();
    const chartsData = await fetchRewardsChartsData({
      cid: vaultsDataReportCid,
      dashboard: dashboardAddress,
      limit: count,
      cacheUse,
    });
    renderRewardsCharts(chartsData);
  });
