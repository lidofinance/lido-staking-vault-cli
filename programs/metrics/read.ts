import { Address, formatEther } from 'viem';
import { Option } from 'commander';
import { program } from 'command';

import { getDashboardContract, getVaultHubContract } from 'contracts';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
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
  .argument('<address>', 'dashboard address', stringToAddress)
  .option('-g, --gateway', 'ipfs gateway url')
  .action(async (address: Address, { gateway }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    await fetchAndVerifyFile(vaultsDataReportCid, gateway);

    const dashboardContract = getDashboardContract(address);
    const vault = await callReadMethod(dashboardContract, 'stakingVault');

    const { cacheUse } = program.opts();
    const reportCurrent = await getVaultReport(
      {
        vault,
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
    );
    const reportPrevious = await getVaultPreviousReport(
      {
        vault,
        cid: vaultsDataReportCid,
        gateway,
      },
      cacheUse,
    );
    const statisticData = await getReportStatisticData({
      dashboard: address,
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
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<count>', 'count of reports', stringToNumber)
  .option('-s, --simplified', 'simplified charts')
  .action(async (address: Address, count: number, { simplified }) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');
    const { cacheUse } = program.opts();

    if (simplified) {
      await renderSimpleCharts({
        dashboard: address,
        cid: vaultsDataReportCid,
        limit: count,
        cacheUse,
      });
    } else {
      const chartsData = await fetchAprChartsData({
        cid: vaultsDataReportCid,
        dashboard: address,
        limit: count,
        cacheUse,
      });
      renderAprCharts(chartsData);
    }
  });

metricsRead
  .command('charts-rewards')
  .description('get APR charts data for N last reports')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<count>', 'count of reports', stringToNumber)
  .action(async (address: Address, count: number) => {
    const vaultHubContract = await getVaultHubContract();
    const [_vaultsDataTimestamp, _vaultsDataTreeRoot, vaultsDataReportCid] =
      await callReadMethod(vaultHubContract, 'latestReportData');

    const { cacheUse } = program.opts();
    const chartsData = await fetchRewardsChartsData({
      cid: vaultsDataReportCid,
      dashboard: address,
      limit: count,
      cacheUse,
    });
    renderRewardsCharts(chartsData);
  });
