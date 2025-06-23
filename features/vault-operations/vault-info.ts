import { formatEther } from 'viem';

import { DashboardContract } from 'contracts';
import {
  formatBP,
  logInfo,
  logTable,
  logResult,
  showSpinner,
  printError,
} from 'utils';
import { getPublicClient } from 'providers';

export const getVaultInfoByDashboard = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  try {
    const [
      steth,
      wsteth,
      eth,
      lidoLocator,
      vaultHub,
      vault,
      reserveRatioBP,
      forcedRebalanceThresholdBP,
      infraFeeBP,
      liquidityFeeBP,
      reservationFeeBP,
      shareLimit,
      liabilityShares,
      unsettledObligations,
      totalValue,
      locked,
      maxLockableValue,
      totalMintingCapacityShares,
      remainingMintingCapacityShares,
      withdrawableValue,
      nodeOperatorFeeRecipient,
      rewardsAdjustment,
      nodeOperatorDisbursableFee,
      nodeOperatorFeeRate,
      confirmExpiry,
      maxConfirmExpiry,
      minConfirmExpiry,
    ] = await Promise.all([
      contract.read.STETH(),
      contract.read.WSTETH(),
      contract.read.ETH(),
      contract.read.LIDO_LOCATOR(),
      contract.read.VAULT_HUB(),
      contract.read.stakingVault(),

      contract.read.reserveRatioBP(),
      contract.read.forcedRebalanceThresholdBP(),
      contract.read.infraFeeBP(),
      contract.read.liquidityFeeBP(),
      contract.read.reservationFeeBP(),
      contract.read.shareLimit(),
      contract.read.liabilityShares(),
      contract.read.unsettledObligations(),
      contract.read.totalValue(),
      contract.read.locked(),
      contract.read.maxLockableValue(),
      contract.read.totalMintingCapacityShares(),
      contract.read.remainingMintingCapacityShares([0n]),
      contract.read.withdrawableValue(),

      contract.read.nodeOperatorFeeRecipient(),
      contract.read.rewardsAdjustment(),
      contract.read.nodeOperatorDisbursableFee(),
      contract.read.nodeOperatorFeeRate(),

      contract.read.getConfirmExpiry(),
      contract.read.MAX_CONFIRM_EXPIRY(),
      contract.read.MIN_CONFIRM_EXPIRY(),
    ]);
    const balance = await publicClient.getBalance({
      address: contract.address,
    });

    hideSpinner();

    logResult({});
    logInfo('Dashboard Base Info');
    logTable({
      data: [
        ['Vault address', vault],
        ['Dashboard address', contract.address],
        ['Vault Hub address', vaultHub],
        ['LIDO Locator address', lidoLocator],
        ['stETH address', steth],
        ['wstETH address', wsteth],
        ['ETH address', eth],
        ['Reserve Ratio, BP', reserveRatioBP],
        ['Reserve Ratio, %', formatBP(reserveRatioBP)],
        ['Forced Rebalance Threshold, BP', forcedRebalanceThresholdBP],
        ['Forced Rebalance Threshold, %', formatBP(forcedRebalanceThresholdBP)],
        ['Infra Fee, BP', infraFeeBP],
        ['Infra Fee, %', formatBP(infraFeeBP)],
        ['Liquidity Fee, BP', liquidityFeeBP],
        ['Liquidity Fee, %', formatBP(liquidityFeeBP)],
        ['Reservation Fee, BP', reservationFeeBP],
        ['Reservation Fee, %', formatBP(reservationFeeBP)],
        ['Share Limit, Shares', shareLimit],
        ['Liability Shares, Shares', formatEther(liabilityShares)],
        ['Unsettled Obligations, ETH', formatEther(unsettledObligations)],
        ['Total Value, ETH', formatEther(totalValue)],
        ['Locked, ETH', formatEther(locked)],
        ['Max Lockable Value, ETH', formatEther(maxLockableValue)],
        ['Balance, ETH', formatEther(balance)],

        [
          'Total Minting Capacity, Shares',
          formatEther(totalMintingCapacityShares),
        ],
        [
          'Remaining Minting Capacity, Shares',
          formatEther(remainingMintingCapacityShares),
        ],
        ['Withdrawable Value, ETH', formatEther(withdrawableValue)],

        ['Node Operator Fee Recipient', nodeOperatorFeeRecipient],
        ['Node Operator Fee Rate, BP', nodeOperatorFeeRate],
        ['Node Operator Fee Rate, %', formatBP(nodeOperatorFeeRate)],
        [
          'Node Operator Disbursable Fee, ETH',
          formatEther(nodeOperatorDisbursableFee),
        ],
        ['Rewards Adjustment amount, ETH', formatEther(rewardsAdjustment[0])],
        ['Rewards Adjustment latestTimestamp', rewardsAdjustment[1]],
        [
          'Confirm Expiry',
          `${confirmExpiry} (${Number(confirmExpiry) / 3600} hours)`,
        ],
        [
          'Max Confirm Expiry',
          `${maxConfirmExpiry} (${Number(maxConfirmExpiry) / 3600} hours)`,
        ],
        [
          'Min Confirm Expiry',
          `${minConfirmExpiry} (${Number(minConfirmExpiry) / 3600} hours)`,
        ],
      ],
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};
