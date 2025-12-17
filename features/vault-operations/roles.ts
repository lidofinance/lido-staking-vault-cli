import { Hex } from 'viem';
import { DashboardContract } from 'contracts';

import { DASHBOARD_ROLES_KEYS, RoleName } from './vault-roles.js';
import {
  addressPrompt,
  callReadMethodSilent,
  confirmOperation,
  confirmPrompt,
  selectPrompt,
} from 'utils';
import { RoleAssignment } from 'types';

const getRoleNameByKeccak = async (
  contract: DashboardContract,
  rolesKeccak: Hex[],
) => {
  const roleValues: Hex[] = await Promise.all(
    DASHBOARD_ROLES_KEYS.map((key) => (contract.read as any)[key]()),
  );
  const roles = Object.fromEntries(
    DASHBOARD_ROLES_KEYS.map((key, index) => [key, roleValues[index]]),
  ) as Record<(typeof DASHBOARD_ROLES_KEYS)[number], Hex>;

  const rolesNames = rolesKeccak
    .map((keccak) => {
      const roleName = Object.keys(roles).find(
        (name) => roles[name as RoleName] === keccak,
      );
      return roleName;
    })
    .filter((roleName) => roleName !== undefined);

  return rolesNames;
};

const getKeccakByRoleName = async (
  contract: DashboardContract,
  roleName: RoleName[],
) => {
  const roleKeccak = await Promise.all(
    roleName.map((name) => callReadMethodSilent(contract, name)),
  );

  return Object.fromEntries(
    roleName.map((name, index) => [name, roleKeccak[index]]),
  );
};

export const logRolesOperations = async (
  contract: DashboardContract,
  roleAssignment: RoleAssignment[],
  operation: 'grant' | 'revoke',
) => {
  const rolesNames = await getRoleNameByKeccak(
    contract,
    roleAssignment.map((role) => role.role),
  );
  const vault = await callReadMethodSilent(contract, 'stakingVault');

  const addressesWithRoles = roleAssignment.map((role, index) => ({
    address: role.account,
    role: rolesNames[index],
  }));

  const roleList = addressesWithRoles
    .map((role) => `${role.role}: ${role.address}`)
    .join('\n');

  const message =
    'Are you sure you want to ' +
    operation +
    ' the roles ' +
    '\n' +
    roleList +
    '\n' +
    ' in the vault ' +
    vault +
    ` (dashboard: ${contract.address})?`;

  const confirm = await confirmOperation(message);

  return confirm;
};

export const askRoleOperationInfo = async (
  contract: DashboardContract,
  operation: 'grant' | 'revoke',
  rolesOverride?: RoleName[],
): Promise<RoleAssignment[]> => {
  const filteredRoles = DASHBOARD_ROLES_KEYS.filter(
    (item) => item !== 'DEFAULT_ADMIN_ROLE',
  );

  const role = await selectPrompt(
    'Select the role to ' + operation,
    'value',
    (rolesOverride ?? filteredRoles).map((role) => ({
      title: role,
      value: role,
    })),
  );

  const rolesRemaining = (rolesOverride ?? filteredRoles).filter(
    (item) => item !== role.value,
  );

  if (!role.value) throw new Error('No role selected');

  const address = await addressPrompt(
    'Enter the address to ' + operation + ' the role ' + role.value,
    'value',
  );

  if (!address.value) throw new Error('No address entered');

  const isMore = await confirmPrompt(
    'Do you want to ' + operation + ' more roles? (y/n)',
    'value',
  );

  const roleKeccak = await getKeccakByRoleName(contract, [role.value]);
  const roleKeccakValue = roleKeccak[role.value];
  if (!roleKeccakValue) {
    throw new Error('No role keccak found for role: ' + role.value);
  }

  if (isMore.value) {
    return [
      ...(await askRoleOperationInfo(contract, operation, rolesRemaining)),
      { role: roleKeccakValue, account: address.value },
    ];
  }

  return [{ role: roleKeccakValue, account: address.value }];
};
