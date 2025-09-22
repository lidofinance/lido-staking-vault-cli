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
  logResult,
  formatRatio,
  fetchAprChartsData,
  renderAprCharts,
  fetchRewardsChartsData,
  renderRewardsCharts,
  stringToNumber,
  renderSimpleCharts,
  getVaultReportHistory,
  prepareGrossStakingRewards,
  prepareNodeOperatorRewards,
  prepareNetStakingRewards,
  callReadMethodSilent,
  cache,
  prepareGrossStakingAPR,
  prepareNetStakingAPR,
  prepareCarrySpread,
  prepareBottomLine,
  prepareDailyLidoFees,
  formatTimestamp,
} from 'utils';
import { checkQuarantine, chooseVaultAndGetDashboard } from 'features';

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

    await checkQuarantine(vaultAddress);

    const lazyOracleContract = await getLazyOracleContract();
    const [
      _vaultsDataTimestamp,
      _vaultsDataRefSlot,
      _vaultsDataTreeRoot,
      vaultsDataReportCid,
    ] = await callReadMethod(lazyOracleContract, 'latestReportData');

    const { cacheUse, csv } = program.opts();
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
        ['Carry Spread, %', formatRatio(statisticData.carrySpread.apr_percent)],
        ['Bottom Line, ETH', formatEther(statisticData.bottomLine)],
      ],
      csvPath: csv,
    });
  });

metricsRead
  .command('statistic-by-reports')
  .description('get statistic data for N last reports')
  .argument('<count>', 'count of reports', stringToNumber)
  .option('-v, --vault <string>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .option('--no-utc', 'do not use UTC time zone')
  .action(async (count: number, { vault, gateway, utc }) => {
    const { contract: dashboardContract, vault: vaultAddress } =
      await chooseVaultAndGetDashboard({ vault });

    await checkQuarantine(vaultAddress);

    const lazyOracleContract = await getLazyOracleContract();
    const [
      _vaultsDataTimestamp,
      _vaultsDataRefSlot,
      _vaultsDataTreeRoot,
      vaultsDataReportCid,
    ] = await callReadMethod(lazyOracleContract, 'latestReportData');

    const { cacheUse, csv } = program.opts();
    const history = await getVaultReportHistory(
      {
        vault: vaultAddress,
        cid: vaultsDataReportCid,
        limit: count,
        direction: 'asc',
        gateway,
      },
      cacheUse,
    );

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
    const [
      grossStakingRewards,
      nodeOperatorRewards,
      netStakingRewards,
      grossStakingAPR,
      netStakingAPR,
      carrySpread,
      bottomLine,
      dailyLidoFees,
    ] = await Promise.all([
      prepareGrossStakingRewards(history),
      prepareNodeOperatorRewards(history, nodeOperatorFeeBPs),
      prepareNetStakingRewards(history, nodeOperatorFeeBPs),
      prepareGrossStakingAPR(history),
      prepareNetStakingAPR(history, nodeOperatorFeeBPs),
      prepareCarrySpread(history, nodeOperatorFeeBPs, vaultAddress),
      prepareBottomLine(history, nodeOperatorFeeBPs, vaultAddress),
      prepareDailyLidoFees(history),
    ]);

    logResult({
      data: [
        ['Gross Staking Rewards, ETH', ...grossStakingRewards.values],
        ['Node Operator Rewards, ETH', ...nodeOperatorRewards.values],
        ['Net Staking Rewards, ETH', ...netStakingRewards.values],
        ['Gross Staking APR, %', ...grossStakingAPR.values.map(formatRatio)],
        ['Net Staking APR, %', ...netStakingAPR.values.map(formatRatio)],
        ['Carry Spread, %', ...carrySpread.values.map(formatRatio)],
        ['Bottom Line, WEI', ...bottomLine.values],
        ['Daily Lido Fees, ETH', ...dailyLidoFees.values],
        ['Timestamp', ...grossStakingRewards.timestamp],
      ],
      params: {
        head: [
          'Metric',
          ...grossStakingRewards.timestamp.map((ts) =>
            formatTimestamp(ts, 'dd.mm hh:mm', utc ? 'UTC' : 'local'),
          ),
        ],
      },
      csvPath: csv,
    });
  });

metricsRead
  .command('report-data')
  .description('get report data for Vault from N last reports')
  .argument('<count>', 'count of reports', stringToNumber)
  .option('-v, --vault <string>', 'vault address')
  .option('-g, --gateway', 'ipfs gateway url')
  .option('--no-utc', 'do not use UTC time zone')
  .action(async (count: number, { vault, gateway, utc }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({ vault });

    await checkQuarantine(vaultAddress);

    const lazyOracleContract = await getLazyOracleContract();
    const [
      _vaultsDataTimestamp,
      _vaultsDataRefSlot,
      _vaultsDataTreeRoot,
      vaultsDataReportCid,
    ] = await callReadMethod(lazyOracleContract, 'latestReportData');

    const { cacheUse } = program.opts();
    const history = await getVaultReportHistory(
      {
        vault: vaultAddress,
        cid: vaultsDataReportCid,
        limit: count,
        direction: 'asc',
        gateway,
      },
      cacheUse,
    );

    logResult({
      data: [
        ['Vault Address', ...history.map((r) => r.data.vaultAddress)],
        ['Total Value, WEI', ...history.map((r) => r.data.totalValueWei)],
        ['Fee, WEI', ...history.map((r) => r.data.fee)],
        [
          'Liability Shares, WEI',
          ...history.map((r) => r.data.liabilityShares),
        ],
        [
          'Slashing Reserve, WEI',
          ...history.map((r) => r.data.slashingReserve),
        ],
        ['In/Out Delta, WEI', ...history.map((r) => r.extraData.inOutDelta)],
        ['Prev Fee, WEI', ...history.map((r) => r.extraData.prevFee)],
        ['Infra Fee, WEI', ...history.map((r) => r.extraData.infraFee)],
        ['Liquidity Fee, WEI', ...history.map((r) => r.extraData.liquidityFee)],
        [
          'Reservation Fee, WEI',
          ...history.map((r) => r.extraData.reservationFee),
        ],
        ['Timestamp', ...history.map((r) => r.timestamp)],
        ['CID', ...history.map((r) => r.cid)],
      ],
      params: {
        head: [
          'Metric',
          ...history.map((r) =>
            formatTimestamp(r.timestamp, 'dd.mm hh:mm', utc ? 'UTC' : 'local'),
          ),
        ],
      },
    });
  });

metricsRead
  .command('charts-apr')
  .description('get APR charts data for N last reports')
  .argument('<count>', 'count of reports', stringToNumber)
  .option('-v, --vault <string>', 'vault address')
  .option('-s, --simplified', 'simplified charts')
  .action(async (count: number, { vault, simplified }) => {
    const { address: dashboardAddress, vault: vaultAddress } =
      await chooseVaultAndGetDashboard({
        vault,
      });

    await checkQuarantine(vaultAddress);

    const lazyOracleContract = await getLazyOracleContract();
    const [
      _vaultsDataTimestamp,
      _vaultsDataRefSlot,
      _vaultsDataTreeRoot,
      vaultsDataReportCid,
    ] = await callReadMethod(lazyOracleContract, 'latestReportData');
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
    const { address: dashboardAddress, vault: vaultAddress } =
      await chooseVaultAndGetDashboard({
        vault,
      });

    await checkQuarantine(vaultAddress);

    const lazyOracleContract = await getLazyOracleContract();
    const [
      _vaultsDataTimestamp,
      _vaultsDataRefSlot,
      _vaultsDataTreeRoot,
      vaultsDataReportCid,
    ] = await callReadMethod(lazyOracleContract, 'latestReportData');

    const { cacheUse } = program.opts();
    const chartsData = await fetchRewardsChartsData({
      cid: vaultsDataReportCid,
      dashboard: dashboardAddress,
      limit: count,
      cacheUse,
    });
    renderRewardsCharts(chartsData);
  });
