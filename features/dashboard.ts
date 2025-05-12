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
  logLiabilityBar,
  logVaultHealthBar,
  logTable,
} from 'utils';

export const getDashboardHealth = async (contract: DashboardContract) => {
  try {
    const {
      healthRatio,
      isHealthy,
      totalValueInEth,
      liabilitySharesInSteth,
      forceRebalanceThresholdBP,
      liabilityShares,
    } = await fetchAndCalculateVaultHealth(contract);

    logResult({});
    logInfo('Vault Health');
    logTable({
      data: [
        ['Vault Healthy', isHealthy],
        ['Health Rate', `${healthRatio}%`],
        ['Total Value, ETH', totalValueInEth],
        ['Liability Shares', liabilityShares],
        ['Liability Shares in stETH', liabilitySharesInSteth],
        ['Rebalance Threshold, %', formatBP(forceRebalanceThresholdBP)],
      ],
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

    logResult({});
    logInfo('Overview');
    logTable({
      data: [
        ['Health Factor', formatRatio(overview.healthRatio)],
        ['Reserve Ratio', formatBP(reserveRatioBP)],
        [
          'Force Rebalance Threshold',
          formatBP(health.forceRebalanceThresholdBP),
        ],
        ['NO Reward Share', formatBP(nodeOperatorFeeBP)],
        ['Utilization Ratio', formatRatio(overview.utilizationRatio)],
        ['Total Value, ETH', formatEther(totalValue)],
        ['stETH Liability', formatEther(health.liabilitySharesInStethWei)],
        [
          'Available To Withdrawal, ETH',
          formatEther(overview.AvailableToWithdrawal),
        ],
        ['Idle Capital, ETH', formatEther(overview.idleCapital)],
        ['Total Locked, ETH', formatEther(overview.totalLocked)],
        ['Collateral, ETH', formatEther(overview.collateral)],
        ['Pending Unlock, ETH', formatEther(overview.PendingUnlock)],
        ['No Rewards Accumulated, ETH', formatEther(nodeOperatorUnclaimedFee)],
        ['Total Reservable, ETH', formatEther(overview.totalReservable)],
        ['Reserved, ETH', formatEther(overview.reserved)],
        [
          'Total Minting Capacity, stETH',
          formatEther(overview.totalMintingCapacityStethWei),
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

    logResult({});
    logInfo('Dashboard Base Info');
    logTable({
      data: [
        ['stETH address', steth],
        ['wstETH address', wsteth],
        ['Vault address', vault],
        ['Vault Hub address', vaultHub],
        ['Reserve Ratio, BP', reserveRatioBP],
        ['Reserve Ratio, %', formatBP(reserveRatioBP)],
        ['Node Operator Fee, BP', nodeOperatorFeeBP],
        ['Node Operator Fee, %', formatBP(nodeOperatorFeeBP)],
        ['Treasury Fee, BP', treasuryFeeBP],
        ['Treasury Fee, %', formatBP(treasuryFeeBP)],
        ['Total Value, ETH', formatEther(totalValue)],
        ['Locked, ETH', formatEther(locked)],
        ['Balance, ETH', formatEther(balance)],
        ['Share Limit, Shares', formatEther(shareLimit)],
        ['Total Minting Capacity, stETH', formatEther(totalMintingCapacity)],
        [
          'Node Operator Unclaimed Fee, ETH',
          formatEther(nodeOperatorUnclaimedFee),
        ],
        [
          'Accrued Rewards Adjustment, ETH',
          formatEther(accruedRewardsAdjustment),
        ],
        [
          'Remaining Minting Capacity, stETH',
          formatEther(remainingMintingCapacity),
        ],

        ['Unreserved, ETH', formatEther(unreserved)],
        ['Withdrawable Ether, ETH', formatEther(withdrawableEther)],
        [
          'Manual Accrued Rewards Adjustment Limit, ETH',
          formatEther(manualAccruedRewardsAdjustmentLimit),
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
        return {
          Role: key,
          Keccak: value,
          Members: accounts.length > 0 ? accounts.join(', ') : 'None',
        };
      }),
    );
    hideSpinner();
    logInfo('Dashboard Roles');
    logResult({
      data: result.map(({ Role, Keccak, Members }) => [Role, Keccak, Members]),
      params: {
        head: ['Role', 'Keccak', 'Members'],
      },
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting roles');
  }
};
