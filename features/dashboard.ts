import { formatEther } from 'viem';

import {
  DashboardContract,
  getStakingVaultContract,
  getStethContract,
} from 'contracts';
import { getPublicClient } from 'providers';
import {
  printError,
  showSpinner,
  logResult,
  fetchAndCalculateVaultHealth,
  logInfo,
  calculateOverview,
  formatBP,
  formatRatio,
  BASIS_POINTS_DENOMINATOR,
  logLiabilityBar,
  logVaultHealthBar,
} from 'utils';

export const getDashboardHealth = async (contract: DashboardContract) => {
  try {
    const {
      healthRatio,
      isHealthy,
      totalValue,
      totalValueInEth,
      liabilitySharesInSteth,
      forceRebalanceThresholdBP,
      liabilityShares,
    } = await fetchAndCalculateVaultHealth(contract);

    logInfo('Vault Health');
    logResult({
      'Vault Healthy': isHealthy,
      'Health Rate': `${healthRatio}%`,
      'Total Value, wei': totalValue,
      'Total Value, ether': totalValueInEth,
      'Liability Shares': liabilityShares,
      'Liability Shares in stETH': liabilitySharesInSteth,
      'Rebalance Threshold, BP': forceRebalanceThresholdBP,
      'Rebalance Threshold, %': `${forceRebalanceThresholdBP / 100}%`,
    });
  } catch (err) {
    if (err instanceof Error) {
      logInfo('Error when getting info:\n', err.message);
    }
  }
};

export const getDashboardOverview = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  try {
    const health = await fetchAndCalculateVaultHealth(contract);
    const [
      vault,
      nodeOperatorFeeBP,
      reserveRatioBP,
      totalMintingCapacity,
      withdrawableEther,
      nodeOperatorUnclaimedFee,
      totalValue,
    ] = await Promise.all([
      contract.read.stakingVault(),
      contract.read.nodeOperatorFeeBP(),
      contract.read.reserveRatioBP(),
      contract.read.totalMintingCapacity(),
      contract.read.withdrawableEther(),
      contract.read.nodeOperatorUnclaimedFee(),
      contract.read.totalValue(),
    ]);
    const vaultContract = getStakingVaultContract(vault);
    const stethContract = await getStethContract();
    const locked = await vaultContract.read.locked();
    const balance = await publicClient.getBalance({
      address: vault,
    });
    const totalMintingCapacityStethWei =
      await stethContract.read.getPooledEthByShares([totalMintingCapacity]);
    const overview = calculateOverview({
      totalValue,
      reserveRatioBP,
      liabilitySharesInStethWei: health.liabilitySharesInStethWei,
      forceRebalanceThresholdBP: health.forceRebalanceThresholdBP,
      withdrawableEther,
      balance,
      locked,
      nodeOperatorUnclaimedFee,
      totalMintingCapacityStethWei,
    });
    hideSpinner();

    logInfo('Overview');
    logResult({
      'Total Value': `${formatEther(totalValue)} ETH`,
      'Reserve Ratio': formatBP(reserveRatioBP),
      'Health Factor': `${formatRatio(overview.healthRatio)}%`,
      'stETH Liability': `${formatEther(health.liabilitySharesInStethWei)} stETH`,
      'Force Rebalance Threshold': formatBP(health.forceRebalanceThresholdBP),
      'Utilization Ratio': formatRatio(overview.utilizationRatio),
      'Available To Withdrawal': `${formatEther(overview.AvailableToWithdrawal)} ETH`,
      'Idle Capital': `${formatEther(overview.idleCapital)} ETH`,
      'Total Locked': `${formatEther(overview.totalLocked)} ETH`,
      Collateral: `${formatEther(overview.collateral)} ETH`,
      'Pending Unlock': `${formatEther(overview.PendingUnlock)} ETH`,
      'No Reward Share': formatBP(nodeOperatorFeeBP),
      'No Rewards Accumulated': `${formatEther(nodeOperatorUnclaimedFee)} ETH`,
      'Total Reservable': `${formatEther(overview.totalReservable)} ETH`,
      Reserved: `${formatEther(overview.reserved)} ETH`,
      'Total Minting Capacity': `${formatEther(overview.totalMintingCapacityStethWei)} stETH`,
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

export const getDashboardBaseInfo = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();
  const publicClient = getPublicClient();

  try {
    const [
      steth,
      wsteth,
      vault,
      vaultHub,
      accruedRewardsAdjustment,
      confirmExpiry,
      nodeOperatorFeeBP,
      remainingMintingCapacity,
      reserveRatioBP,
      shareLimit,
      totalMintingCapacity,
      treasuryFeeBP,
      unreserved,
      withdrawableEther,
      manualAccruedRewardsAdjustmentLimit,
      maxConfirmExpiry,
      minConfirmExpiry,
      nodeOperatorUnclaimedFee,
      totalValue,
    ] = await Promise.all([
      contract.read.STETH(),
      contract.read.WSTETH(),
      contract.read.stakingVault(),
      contract.read.VAULT_HUB(),
      contract.read.accruedRewardsAdjustment(),
      contract.read.getConfirmExpiry(),
      contract.read.nodeOperatorFeeBP(),
      contract.read.remainingMintingCapacity([0n]),
      contract.read.reserveRatioBP(),
      contract.read.shareLimit(),
      contract.read.totalMintingCapacity(),
      contract.read.treasuryFeeBP(),
      contract.read.unreserved(),
      contract.read.withdrawableEther(),
      contract.read.MANUAL_ACCRUED_REWARDS_ADJUSTMENT_LIMIT(),
      contract.read.MAX_CONFIRM_EXPIRY(),
      contract.read.MIN_CONFIRM_EXPIRY(),
      contract.read.nodeOperatorUnclaimedFee(),
      contract.read.totalValue(),
    ]);
    const vaultContract = getStakingVaultContract(vault);
    const locked = await vaultContract.read.locked();
    const balance = await publicClient.getBalance({
      address: contract.address,
    });

    hideSpinner();

    logInfo('Dashboard Base Info');
    logResult({
      'stETH address': steth,
      'wstETH address': wsteth,
      'Vault address': vault,
      'Vault Hub address': vaultHub,
      'Total Value': `${formatEther(totalValue)} ETH`,
      'Reserve Ratio': formatBP(reserveRatioBP),
      Locked: `${formatEther(locked)} ETH`,
      Balance: `${formatEther(balance)} ETH`,
      'Share Limit': `${formatEther(shareLimit)} Shares`,
      'Share Limit in Wei': shareLimit,
      'Total Minting Capacity': `${formatEther(totalMintingCapacity)} stETH`,
      'Node Operator Unclaimed Fee': `${formatEther(nodeOperatorUnclaimedFee)} ETH`,
      'Accrued Rewards Adjustment': `${formatEther(accruedRewardsAdjustment)} ETH`,
      'Node Operator Fee BP': formatBP(nodeOperatorFeeBP),
      'Remaining Minting Capacity': `${formatEther(remainingMintingCapacity)} stETH`,
      'Treasury Fee BP': treasuryFeeBP,
      'Treasury Fee BP in Percent': `${(Number(treasuryFeeBP) / Number(BASIS_POINTS_DENOMINATOR)) * 100}%`,
      Unreserved: `${formatEther(unreserved)} ETH`,
      'Withdrawable Ether': `${formatEther(withdrawableEther)} ETH`,
      'Manual Accrued Rewards Adjustment Limit': `${formatEther(
        manualAccruedRewardsAdjustmentLimit,
      )} ETH`,
      'Confirm Expiry': `${confirmExpiry} (${Number(confirmExpiry) / 3600} hours)`,
      'Max Confirm Expiry': `${maxConfirmExpiry} (${Number(maxConfirmExpiry) / 3600} hours)`,
      'Min Confirm Expiry': `${minConfirmExpiry} (${Number(minConfirmExpiry) / 3600} hours)`,
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};

export const getDashboardRoles = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();

  try {
    const BURN_ROLE = await contract.read.BURN_ROLE();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const FUND_ROLE = await contract.read.FUND_ROLE();
    const LIDO_VAULTHUB_AUTHORIZATION_ROLE =
      await contract.read.LIDO_VAULTHUB_AUTHORIZATION_ROLE();
    const LIDO_VAULTHUB_DEAUTHORIZATION_ROLE =
      await contract.read.LIDO_VAULTHUB_DEAUTHORIZATION_ROLE();
    const LOCK_ROLE = await contract.read.LOCK_ROLE();
    const MINT_ROLE = await contract.read.MINT_ROLE();
    const NODE_OPERATOR_FEE_CLAIM_ROLE =
      await contract.read.NODE_OPERATOR_FEE_CLAIM_ROLE();
    const NODE_OPERATOR_MANAGER_ROLE =
      await contract.read.NODE_OPERATOR_MANAGER_ROLE();
    const NODE_OPERATOR_REWARDS_ADJUST_ROLE =
      await contract.read.NODE_OPERATOR_REWARDS_ADJUST_ROLE();
    const OSSIFY_ROLE = await contract.read.OSSIFY_ROLE();
    const PAUSE_BEACON_CHAIN_DEPOSITS_ROLE =
      await contract.read.PAUSE_BEACON_CHAIN_DEPOSITS_ROLE();
    const PDG_COMPENSATE_PREDEPOSIT_ROLE =
      await contract.read.PDG_COMPENSATE_PREDEPOSIT_ROLE();
    const PDG_PROVE_VALIDATOR_ROLE =
      await contract.read.PDG_PROVE_VALIDATOR_ROLE();
    const REBALANCE_ROLE = await contract.read.REBALANCE_ROLE();
    const RECOVER_ASSETS_ROLE = await contract.read.RECOVER_ASSETS_ROLE();
    const REQUEST_TIER_CHANGE_ROLE =
      await contract.read.REQUEST_TIER_CHANGE_ROLE();
    const REQUEST_VALIDATOR_EXIT_ROLE =
      await contract.read.REQUEST_VALIDATOR_EXIT_ROLE();
    const RESET_LOCKED_ROLE = await contract.read.RESET_LOCKED_ROLE();
    const RESUME_BEACON_CHAIN_DEPOSITS_ROLE =
      await contract.read.RESUME_BEACON_CHAIN_DEPOSITS_ROLE();
    const SET_DEPOSITOR_ROLE = await contract.read.SET_DEPOSITOR_ROLE();
    const TRIGGER_VALIDATOR_WITHDRAWAL_ROLE =
      await contract.read.TRIGGER_VALIDATOR_WITHDRAWAL_ROLE();
    const UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE =
      await contract.read.UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE();
    const VOLUNTARY_DISCONNECT_ROLE =
      await contract.read.VOLUNTARY_DISCONNECT_ROLE();
    const WITHDRAW_ROLE = await contract.read.WITHDRAW_ROLE();

    const roles = {
      BURN_ROLE,
      DEFAULT_ADMIN_ROLE,
      FUND_ROLE,
      LIDO_VAULTHUB_AUTHORIZATION_ROLE,
      LIDO_VAULTHUB_DEAUTHORIZATION_ROLE,
      LOCK_ROLE,
      MINT_ROLE,
      NODE_OPERATOR_FEE_CLAIM_ROLE,
      NODE_OPERATOR_MANAGER_ROLE,
      NODE_OPERATOR_REWARDS_ADJUST_ROLE,
      OSSIFY_ROLE,
      PAUSE_BEACON_CHAIN_DEPOSITS_ROLE,
      PDG_COMPENSATE_PREDEPOSIT_ROLE,
      PDG_PROVE_VALIDATOR_ROLE,
      REBALANCE_ROLE,
      RECOVER_ASSETS_ROLE,
      REQUEST_TIER_CHANGE_ROLE,
      REQUEST_VALIDATOR_EXIT_ROLE,
      RESET_LOCKED_ROLE,
      RESUME_BEACON_CHAIN_DEPOSITS_ROLE,
      SET_DEPOSITOR_ROLE,
      TRIGGER_VALIDATOR_WITHDRAWAL_ROLE,
      UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE,
      VOLUNTARY_DISCONNECT_ROLE,
      WITHDRAW_ROLE,
    };

    const result = await Promise.all(
      Object.entries(roles).map(async ([key, value]) => {
        const accounts = await contract.read.getRoleMembers([value]);
        const roleName = `${key} (${value})`;
        return {
          Role: roleName,
          Members: accounts.length > 0 ? accounts.join(', ') : 'None',
        };
      }),
    );
    hideSpinner();
    logInfo('Dashboard Roles');
    logResult(result);
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting roles');
  }
};
