import { formatEther, Hex } from 'viem';

import { DashboardContract, getStethContract } from 'contracts';
import { getPublicClient } from 'providers';
import {
  printError,
  showSpinner,
  logResult,
  fetchAndCalculateVaultHealth,
  logInfo,
  // calculateOverview,
  calculateOverviewV2,
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

export const getDashboardBaseInfo = async (contract: DashboardContract) => {
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
        ['stETH address', steth],
        ['wstETH address', wsteth],
        ['ETH address', eth],
        ['LIDO Locator address', lidoLocator],
        ['Vault Hub address', vaultHub],
        ['Vault address', vault],
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
        ['Node Operator Fee Rate, %', formatBP(nodeOperatorFeeRate)],
        [
          'Node Operator Disbursable Fee, ETH',
          formatEther(nodeOperatorDisbursableFee),
        ],
        ['Node Operator Fee Recipient', nodeOperatorFeeRecipient],
        ['Rewards Adjustment amount, ETH', formatEther(rewardsAdjustment[0])],
        ['Rewards Adjustment latestTimestamp', rewardsAdjustment[1]],

        [
          'Node Operator disbursable Fee, ETH',
          formatEther(nodeOperatorDisbursableFee),
        ],
        ['Node Operator Fee, BP', nodeOperatorFeeRate],
        ['Node Operator Fee, %', formatBP(nodeOperatorFeeRate)],
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
    const roleKeys = [
      'BURN_ROLE',
      'DEFAULT_ADMIN_ROLE',
      'FUND_ROLE',
      'LIDO_VAULTHUB_AUTHORIZATION_ROLE',
      'LIDO_VAULTHUB_DEAUTHORIZATION_ROLE',
      'LOCK_ROLE',
      'MINT_ROLE',
      'NODE_OPERATOR_FEE_CLAIM_ROLE',
      'NODE_OPERATOR_MANAGER_ROLE',
      'NODE_OPERATOR_REWARDS_ADJUST_ROLE',
      'OSSIFY_ROLE',
      'PAUSE_BEACON_CHAIN_DEPOSITS_ROLE',
      'PDG_COMPENSATE_PREDEPOSIT_ROLE',
      'PDG_PROVE_VALIDATOR_ROLE',
      'REBALANCE_ROLE',
      'RECOVER_ASSETS_ROLE',
      'REQUEST_TIER_CHANGE_ROLE',
      'REQUEST_VALIDATOR_EXIT_ROLE',
      'RESET_LOCKED_ROLE',
      'RESUME_BEACON_CHAIN_DEPOSITS_ROLE',
      'SET_DEPOSITOR_ROLE',
      'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE',
      'UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE',
      'VOLUNTARY_DISCONNECT_ROLE',
      'WITHDRAW_ROLE',
    ] as const;

    const roleValues: Hex[] = await Promise.all(
      roleKeys.map((key) => (contract.read as any)[key]()),
    );

    const roles = Object.fromEntries(
      roleKeys.map((key, index) => [key, roleValues[index]]),
    ) as Record<(typeof roleKeys)[number], Hex>;

    const result = await Promise.all(
      roleKeys.map(async (key) => {
        const accounts = await contract.read.getRoleMembers([roles[key]]);
        return {
          Role: key,
          Keccak: roles[key],
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
