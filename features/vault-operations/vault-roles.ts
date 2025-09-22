import { Address, Hex } from 'viem';

import { DashboardContract } from 'contracts';
import {
  printError,
  showSpinner,
  logResult,
  logInfo,
  callReadMethodSilent,
} from 'utils';

export type RoleName =
  | 'DEFAULT_ADMIN_ROLE'
  | 'BURN_ROLE'
  | 'FUND_ROLE'
  | 'MINT_ROLE'
  | 'WITHDRAW_ROLE'
  | 'NODE_OPERATOR_MANAGER_ROLE'
  | 'NODE_OPERATOR_REWARDS_ADJUST_ROLE'
  | 'PAUSE_BEACON_CHAIN_DEPOSITS_ROLE'
  | 'RESUME_BEACON_CHAIN_DEPOSITS_ROLE'
  | 'PDG_PROVE_VALIDATOR_ROLE'
  | 'REBALANCE_ROLE'
  | 'REQUEST_VALIDATOR_EXIT_ROLE'
  | 'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE'
  | 'UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE'
  | 'VOLUNTARY_DISCONNECT_ROLE'
  | 'VAULT_CONFIGURATION_ROLE';

export const getVaultRolesByDashboard = async (contract: DashboardContract) => {
  const hideSpinner = showSpinner();

  try {
    const roleKeys: RoleName[] = [
      'DEFAULT_ADMIN_ROLE',
      'BURN_ROLE',
      'FUND_ROLE',
      'MINT_ROLE',
      'WITHDRAW_ROLE',
      'NODE_OPERATOR_MANAGER_ROLE',
      'NODE_OPERATOR_REWARDS_ADJUST_ROLE',
      'PAUSE_BEACON_CHAIN_DEPOSITS_ROLE',
      'RESUME_BEACON_CHAIN_DEPOSITS_ROLE',
      'PDG_PROVE_VALIDATOR_ROLE',
      'REBALANCE_ROLE',
      'REQUEST_VALIDATOR_EXIT_ROLE',
      'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE',
      'UNGUARANTEED_BEACON_CHAIN_DEPOSIT_ROLE',
      'VOLUNTARY_DISCONNECT_ROLE',
      'VAULT_CONFIGURATION_ROLE',
    ];

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

export const checkVaultRole = async (
  contract: DashboardContract,
  roleName: RoleName,
  address: Address,
) => {
  const ownerRole = await callReadMethodSilent(contract, 'DEFAULT_ADMIN_ROLE');
  const ownerMembers = await contract.read.getRoleMembers([ownerRole]);
  if (
    ownerMembers.some(
      (member) => member.toLowerCase() === address.toLowerCase(),
    )
  )
    return true;

  const roleKeccak = await callReadMethodSilent(contract, roleName);
  const roleMembers = await contract.read.getRoleMembers([roleKeccak]);

  const hasRole = roleMembers
    .map((member) => member.toLowerCase())
    .includes(address.toLowerCase());

  if (!hasRole) {
    throw new Error(`Address ${address} does not have the ${roleName} role`);
  }

  return hasRole;
};
