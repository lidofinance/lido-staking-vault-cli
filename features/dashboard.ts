import {
  printError,
  showSpinner,
  logResult,
  fetchAndCalculateVaultHealth,
} from 'utils';
import { DashboardContract } from 'contracts';

export const getDashboardBaseInfo = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();
  try {
    const steth = await contract.read.STETH();
    const wsteth = await contract.read.WSTETH();
    const isInit = await contract.read.initialized();
    const vault = await contract.read.stakingVault();
    const vaultHub = await contract.read.VAULT_HUB();
    const accruedRewardsAdjustment =
      await contract.read.accruedRewardsAdjustment();
    const confirmExpiry = await contract.read.getConfirmExpiry();
    const nodeOperatorFeeBP = await contract.read.nodeOperatorFeeBP();
    const remainingMintingCapacity =
      await contract.read.remainingMintingCapacity([0n]);
    const reserveRatioBP = await contract.read.reserveRatioBP();
    const shareLimit = await contract.read.shareLimit();
    const totalMintingCapacity = await contract.read.totalMintingCapacity();
    const treasuryFeeBP = await contract.read.treasuryFeeBP();
    const unreserved = await contract.read.unreserved();
    const withdrawableEther = await contract.read.withdrawableEther();
    const manualAccruedRewardsAdjustmentLimit =
      await contract.read.MANUAL_ACCRUED_REWARDS_ADJUSTMENT_LIMIT();
    const maxConfirmExpiry = await contract.read.MAX_CONFIRM_EXPIRY();
    const minConfirmExpiry = await contract.read.MIN_CONFIRM_EXPIRY();
    const health = await fetchAndCalculateVaultHealth(contract);

    hideSpinner();

    const payload = {
      steth,
      wsteth,
      vault,
      isInit,
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
      health,
    };

    logResult(Object.entries(payload));
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
    logResult(result);
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting roles');
  }
};
