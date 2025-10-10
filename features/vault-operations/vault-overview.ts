import { formatEther } from 'viem';

import {
  DashboardContract,
  getLazyOracleContract,
  getOperatorGridContract,
  getStethContract,
  getVaultHubContract,
} from 'contracts';
import { getPublicClient } from 'providers';
import {
  fetchAndCalculateVaultHealth,
  formatBP,
  formatRatio,
  showSpinner,
  logInfo,
  logTable,
  logResult,
  logLiabilityBar,
  logVaultHealthBar,
  printError,
  calculateOverviewV2,
  getVaultReport,
  callReadMethodSilent,
  VaultReport,
} from 'utils';
import { reportFreshWarning } from 'features';

export const getVaultOverviewByDashboard = async (
  contract: DashboardContract,
) => {
  const vault = await callReadMethodSilent(contract, 'stakingVault');
  await reportFreshWarning(vault);

  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  let report: VaultReport | null = null;

  try {
    const lazyOracleContract = await getLazyOracleContract();
    const [_timestamp, _refSlot, _treeRoot, cid] = await callReadMethodSilent(
      lazyOracleContract,
      'latestReportData',
    );
    report = await getVaultReport({ vault, cid });
  } catch (error) {
    logInfo('No report found');
  }

  try {
    const health = await fetchAndCalculateVaultHealth(contract);
    const operatorGridContract = await getOperatorGridContract();
    const [
      vaultConnection,
      totalMintingCapacityShares,
      withdrawableValue,
      totalValue,
      locked,
      remainingMintingCapacityShares,
      minimalReserve,
      nodeOperatorFeeRate,
      nodeOperatorAccruedFee,
    ] = await Promise.all([
      contract.read.vaultConnection(),
      contract.read.totalMintingCapacityShares(),
      contract.read.withdrawableValue(),
      contract.read.totalValue(),
      contract.read.locked(),
      contract.read.remainingMintingCapacityShares([0n]),
      contract.read.minimalReserve(),
      contract.read.feeRate(),
      contract.read.accruedFee(),
    ]);

    const { reserveRatioBP, shareLimit } = vaultConnection;
    const stethContract = await getStethContract();
    const vaultHubContract = await getVaultHubContract();
    const balance = await publicClient.getBalance({
      address: vault,
    });
    const vaultObligation = await callReadMethodSilent(
      vaultHubContract,
      'obligations',
      [vault],
    );
    const tierInfo = await callReadMethodSilent(
      operatorGridContract,
      'vaultTierInfo',
      [vault],
    );
    const isNoHaveGroup =
      tierInfo[0] === '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF';
    const nodeOperatorGroup = await callReadMethodSilent(
      operatorGridContract,
      'group',
      [tierInfo[0]],
    );
    const [
      totalMintingCapacityStethWei,
      shareLimitStethWei,
      tierShareLimitStethWei,
      groupShareLimitStethWei,
      remainingMintingCapacityStethWei,
      lastReportLiabilityInStethWei,
    ] = await Promise.all([
      stethContract.read.getPooledEthBySharesRoundUp([
        totalMintingCapacityShares,
      ]),
      stethContract.read.getPooledEthBySharesRoundUp([shareLimit]),
      stethContract.read.getPooledEthBySharesRoundUp([tierInfo[2]]),
      stethContract.read.getPooledEthBySharesRoundUp([
        nodeOperatorGroup.shareLimit,
      ]),
      stethContract.read.getPooledEthBySharesRoundUp([
        remainingMintingCapacityShares,
      ]),
      report
        ? stethContract.read.getPooledEthBySharesRoundUp([
            BigInt(report.data.liabilityShares),
          ])
        : 0n,
    ]);

    const overview = calculateOverviewV2({
      totalValue,
      reserveRatioBP,
      liabilitySharesInStethWei: health.liabilitySharesInStethWei,
      forcedRebalanceThresholdBP: health.forcedRebalanceThresholdBP,
      withdrawableEther: withdrawableValue,
      balance,
      locked,
      nodeOperatorAccruedFee,
      totalMintingCapacityStethWei,
      unsettledLidoFees: vaultObligation[1],
      minimalReserve,
      lastReportLiabilityInStethWei,
    });

    hideSpinner();

    logResult({});
    logInfo('Overview');
    logTable({
      data: [
        ['Health Factor', formatRatio(overview.healthRatio)],
        ['Reserve Ratio, %', formatBP(reserveRatioBP)],
        [
          'Force Rebalance Threshold',
          formatBP(health.forcedRebalanceThresholdBP),
        ],
        ['stVault Share Limit, stETH', formatEther(shareLimitStethWei)],
        ['stVault Share Limit, Shares', formatEther(shareLimit)],
        ['Node Operator Fee Rate, %', formatBP(nodeOperatorFeeRate)],
        ['Utilization Ratio, %', formatRatio(overview.utilizationRatio)],
        ['Total Value, ETH', formatEther(totalValue)],
        ['Liability, stETH', formatEther(health.liabilitySharesInStethWei)],
        ['Liability, Shares', formatEther(health.liabilitySharesInWei)],
        [
          'Available To Withdrawal, ETH',
          formatEther(overview.availableToWithdrawal),
        ],
        ['Idle Capital, ETH', formatEther(overview.idleCapital)],
        ['Locked, ETH', formatEther(locked)],
        ['Total Locked, ETH', formatEther(overview.totalLocked)],
        ['Collateral, ETH', formatEther(overview.collateral)],
        ['Recently Repaid, ETH', formatEther(overview.recentlyRepaid)],
        ['Node Operator Accrued Fee, ETH', formatEther(nodeOperatorAccruedFee)],
        ['Reserved, ETH', formatEther(overview.reserved)],
        [
          'Total Minting Capacity, stETH',
          formatEther(overview.totalMintingCapacityStethWei),
        ],
        [
          'Remaining Minting Capacity, stETH',
          formatEther(remainingMintingCapacityStethWei),
        ],
        [
          'Remaining Minting Capacity, Shares',
          formatEther(remainingMintingCapacityShares),
        ],
        ['Unsettled Lido Fees, ETH', formatEther(vaultObligation[1])],
        ['Shares to Burn, Shares', formatEther(vaultObligation[0])],
        ['Tier ID', tierInfo[1]],
        ['Tier Share Limit, stETH', formatEther(tierShareLimitStethWei)],
        ['Tier Share Limit, Shares', formatEther(tierInfo[2])],
        [
          'Group Share Limit, stETH',
          isNoHaveGroup ? 'N/A' : formatEther(groupShareLimitStethWei),
        ],
        [
          'Group Share Limit, Shares',
          isNoHaveGroup ? 'N/A' : formatEther(nodeOperatorGroup.shareLimit),
        ],
      ],
    });

    logLiabilityBar({
      totalValue: totalValue,
      stETHLiability: health.liabilitySharesInStethWei,
      reserveRatioBP: reserveRatioBP,
      forcedRebalanceThresholdBP: health.forcedRebalanceThresholdBP,
      stETHTotalMintingCapacity: totalMintingCapacityStethWei,
    });
    console.info('\n');
    logVaultHealthBar(overview.healthRatio);
    console.info('\n');
  } catch (err) {
    // hideSpinner();
    printError(err, 'Error when getting overview');
  }
};
