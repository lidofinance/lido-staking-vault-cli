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

import {
  getVaultHealthByDashboard,
  getVaultInfoByDashboard,
} from './vault-operations/index.js';

export const getDashboardHealth = async (contract: DashboardContract) => {
  return getVaultHealthByDashboard(contract);
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
  await getVaultInfoByDashboard(contract);
};

export const getDashboardRoles = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();

  try {
    const roleKeys = [
      'DEFAULT_ADMIN_ROLE',
      'CHANGE_TIER_ROLE',
      'BURN_ROLE',
      'FUND_ROLE',
      'MINT_ROLE',
      'WITHDRAW_ROLE',
      'NODE_OPERATOR_MANAGER_ROLE',
      'NODE_OPERATOR_REWARDS_ADJUST_ROLE',
      'PAUSE_BEACON_CHAIN_DEPOSITS_ROLE',
      'RESUME_BEACON_CHAIN_DEPOSITS_ROLE',
      'PDG_COMPENSATE_PREDEPOSIT_ROLE',
      'PDG_PROVE_VALIDATOR_ROLE',
      'REBALANCE_ROLE',
      'RECOVER_ASSETS_ROLE',
      'REQUEST_VALIDATOR_EXIT_ROLE',
      'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE',
      'UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE',
      'VOLUNTARY_DISCONNECT_ROLE',
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
