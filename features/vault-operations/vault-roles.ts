import { Hex } from 'viem';

import { DashboardContract } from 'contracts';
import { printError, showSpinner, logResult, logInfo } from 'utils';

export const getVaultRolesByDashboard = async (contract: DashboardContract) => {
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
