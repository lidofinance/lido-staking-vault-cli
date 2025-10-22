import { formatEther } from 'viem';

import { DashboardContract } from 'contracts';
import {
  formatBP,
  logInfo,
  logTable,
  logResult,
  showSpinner,
  printError,
  callReadMethodSilent,
} from 'utils';
import { getPublicClient } from 'providers';
import { reportFreshWarning } from 'features';

export const getVaultInfoByDashboard = async (contract: DashboardContract) => {
  const vault = await callReadMethodSilent(contract, 'stakingVault');
  await reportFreshWarning(vault);

  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  try {
    const [
      steth,
      wsteth,
      lidoLocator,
      vaultHub,
      vaultConnection,
      liabilityShares,
      obligations,
      totalValue,
      locked,
      maxLockableValue,
      totalMintingCapacityShares,
      remainingMintingCapacityShares,
      withdrawableValue,
      feeRecipient,
      nodeOperatorAccruedFee,
      feeRate,
      confirmExpiry,
      maxConfirmExpiry,
      minConfirmExpiry,
    ] = await Promise.all([
      contract.read.STETH(),
      contract.read.WSTETH(),
      contract.read.LIDO_LOCATOR(),
      contract.read.VAULT_HUB(),

      contract.read.vaultConnection(),
      contract.read.liabilityShares(),
      contract.read.obligations(),
      contract.read.totalValue(),
      contract.read.locked(),
      contract.read.maxLockableValue(),
      contract.read.totalMintingCapacityShares(),
      contract.read.remainingMintingCapacityShares([0n]),
      contract.read.withdrawableValue(),

      contract.read.feeRecipient(),
      contract.read.accruedFee(),
      contract.read.feeRate(),

      contract.read.getConfirmExpiry(),
      contract.read.MAX_CONFIRM_EXPIRY(),
      contract.read.MIN_CONFIRM_EXPIRY(),
    ]);
    const balance = await publicClient.getBalance({
      address: vault,
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
        ['Reserve Ratio, BP', vaultConnection.reserveRatioBP],
        ['Reserve Ratio, %', formatBP(vaultConnection.reserveRatioBP)],
        [
          'Forced Rebalance Threshold, BP',
          vaultConnection.forcedRebalanceThresholdBP,
        ],
        [
          'Forced Rebalance Threshold, %',
          formatBP(vaultConnection.forcedRebalanceThresholdBP),
        ],
        ['Infra Fee, BP', vaultConnection.infraFeeBP],
        ['Infra Fee, %', formatBP(vaultConnection.infraFeeBP)],
        ['Liquidity Fee, BP', vaultConnection.liquidityFeeBP],
        ['Liquidity Fee, %', formatBP(vaultConnection.liquidityFeeBP)],
        ['Reservation Fee, BP', vaultConnection.reservationFeeBP],
        ['Reservation Fee, %', formatBP(vaultConnection.reservationFeeBP)],
        ['Share Limit, Shares', vaultConnection.shareLimit],
        ['Liability Shares, Shares', formatEther(liabilityShares)],
        ['Obligations (sharesToBurn), Shares', formatEther(obligations[0])],
        ['Obligations (feesToSettle), ETH', formatEther(obligations[1])],
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

        ['Node Operator Fee Recipient', feeRecipient],
        ['Node Operator Fee Rate, BP', feeRate],
        ['Node Operator Fee Rate, %', formatBP(feeRate)],
        [
          'Node Operator Disbursable Fee, ETH',
          formatEther(nodeOperatorAccruedFee),
        ],
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
