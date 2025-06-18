import { formatEther } from 'viem';

import { DashboardContract, getStethContract } from 'contracts';
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
} from 'utils';

export const getVaultOverviewByDashboard = async (
  contract: DashboardContract,
) => {
  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  try {
    const health = await fetchAndCalculateVaultHealth(contract);
    const [
      vault,
      nodeOperatorFeeRate,
      reserveRatioBP,
      totalMintingCapacityShares,
      withdrawableValue,
      nodeOperatorDisbursableFee,
      totalValue,
      locked,
    ] = await Promise.all([
      contract.read.stakingVault(),
      contract.read.nodeOperatorFeeRate(),
      contract.read.reserveRatioBP(),
      contract.read.totalMintingCapacityShares(),
      contract.read.withdrawableValue(),
      contract.read.nodeOperatorDisbursableFee(),
      contract.read.totalValue(),
      contract.read.locked(),
    ]);
    const stethContract = await getStethContract();
    const balance = await publicClient.getBalance({
      address: vault,
    });
    const totalMintingCapacityStethWei =
      await stethContract.read.getPooledEthBySharesRoundUp([
        totalMintingCapacityShares,
      ]);
    const overview = calculateOverviewV2({
      totalValue,
      reserveRatioBP,
      liabilitySharesInStethWei: health.liabilitySharesInStethWei,
      liabilitySharesInWei: health.liabilitySharesInWei,
      forceRebalanceThresholdBP: health.forceRebalanceThresholdBP,
      withdrawableEther: withdrawableValue,
      balance,
      locked,
      nodeOperatorDisbursableFee,
      totalMintingCapacityStethWei,
      totalMintingCapacitySharesInWei: totalMintingCapacityShares,
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
        ['Node Operator Fee Rate, %', formatBP(nodeOperatorFeeRate)],
        ['Utilization Ratio, %', formatRatio(overview.utilizationRatio)],
        ['Total Value, ETH', formatEther(totalValue)],
        ['Liability, stETH', formatEther(health.liabilitySharesInStethWei)],
        ['Liability, Shares', formatEther(health.liabilitySharesInWei)],
        [
          'Available To Withdrawal, ETH',
          formatEther(overview.AvailableToWithdrawal),
        ],
        ['Idle Capital, ETH', formatEther(overview.idleCapital)],
        ['Total Locked, ETH', formatEther(overview.totalLocked)],
        ['Collateral, ETH', formatEther(overview.collateral)],
        ['Pending Unlock, ETH', formatEther(overview.PendingUnlock)],
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
          formatEther(overview.remainingMintingCapacitySteth),
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
    hideSpinner();
    printError(err, 'Error when getting overview');
  }
};
