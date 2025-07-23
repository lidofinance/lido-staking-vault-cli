import { formatEther } from 'viem';

import {
  DashboardContract,
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
  callReadMethodSilent,
} from 'utils';
import { reportFreshWarning } from 'features';

export const getVaultOverviewByDashboard = async (
  contract: DashboardContract,
) => {
  const vault = await callReadMethodSilent(contract, 'stakingVault');
  await reportFreshWarning(vault);

  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  try {
    const health = await fetchAndCalculateVaultHealth(contract);
    const operatorGridContract = await getOperatorGridContract();
    const [
      nodeOperatorFeeRate,
      reserveRatioBP,
      totalMintingCapacityShares,
      withdrawableValue,
      nodeOperatorDisbursableFee,
      totalValue,
      locked,
      shareLimit,
      remainingMintingCapacityShares,
    ] = await Promise.all([
      contract.read.nodeOperatorFeeRate(),
      contract.read.reserveRatioBP(),
      contract.read.totalMintingCapacityShares(),
      contract.read.withdrawableValue(),
      contract.read.nodeOperatorDisbursableFee(),
      contract.read.totalValue(),
      contract.read.locked(),
      contract.read.shareLimit(),
      contract.read.remainingMintingCapacityShares([0n]),
    ]);
    const stethContract = await getStethContract();
    const vaultHubContract = await getVaultHubContract();
    const balance = await publicClient.getBalance({
      address: vault,
    });
    const vaultObligation = await callReadMethodSilent(
      vaultHubContract,
      'vaultObligations',
      [vault],
    );
    const tierInfo = await callReadMethodSilent(
      operatorGridContract,
      'vaultInfo',
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
    ]);

    const overview = calculateOverviewV2({
      totalValue,
      reserveRatioBP,
      liabilitySharesInStethWei: health.liabilitySharesInStethWei,
      forceRebalanceThresholdBP: health.forceRebalanceThresholdBP,
      withdrawableEther: withdrawableValue,
      balance,
      locked,
      nodeOperatorDisbursableFee,
      totalMintingCapacityStethWei,
      unsettledLidoFees: vaultObligation.unsettledLidoFees,
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
          formatBP(health.forceRebalanceThresholdBP),
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
        [
          'Node Operator Disbursable Fee, ETH',
          formatEther(nodeOperatorDisbursableFee),
        ],
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
        [
          'Unsettled Lido Fees, ETH',
          formatEther(vaultObligation.unsettledLidoFees),
        ],
        [
          'Settled Lido Fees, ETH',
          formatEther(vaultObligation.settledLidoFees),
        ],
        ['Redemptions, ETH', formatEther(vaultObligation.redemptions)],
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
      forceRebalanceThresholdBP: health.forceRebalanceThresholdBP,
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
