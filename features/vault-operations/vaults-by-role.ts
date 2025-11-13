import { Address, Hex } from 'viem';

import { getVaultViewerContract, getDashboardImplContract } from 'contracts';
import {
  callReadMethodSilent,
  printError,
  selectPrompt,
  showSpinner,
} from 'utils';
import { getAccount } from 'providers';

import { DASHBOARD_ROLES_KEYS } from './vault-roles.js';

type VaultMembers = {
  vault: Address;
  owner: Address;
  nodeOperator: Address;
  members: readonly (readonly Address[])[];
};

const LIMIT = 100n;

export const getAllVaults = async () => {
  const hideSpinner = showSpinner({
    message: 'Getting vaults...',
  });

  try {
    const contract = getVaultViewerContract();
    const totalVaults = await callReadMethodSilent(contract, 'vaultsCount');
    const vaultsByOwner: Address[] = [];

    for (let i = 0n; i < totalVaults; i += LIMIT) {
      const vaults = await callReadMethodSilent(
        contract,
        'vaultAddressesBatch',
        [i, LIMIT],
      );
      vaultsByOwner.push(...vaults);
    }

    return vaultsByOwner;
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting vaults');
    throw err;
  } finally {
    hideSpinner();
  }
};

export const getVaultsByAddress = async (
  address: Address,
): Promise<Record<Address, string[]>> => {
  const contract = getVaultViewerContract();
  const dashboardImpl = getDashboardImplContract();
  const vaults = await getAllVaults();
  const vaultsWithMembers: VaultMembers[] = [];

  const hideSpinner = showSpinner({
    message: 'Getting roles...',
  });
  const rolesValues: Hex[] = await Promise.all(
    DASHBOARD_ROLES_KEYS.map((key) => (dashboardImpl.read as any)[key]()),
  );
  hideSpinner();

  for (let i = 0; i < vaults.length; i += Number(LIMIT)) {
    const batch = await callReadMethodSilent(contract, 'roleMembersBatch', [
      vaults.slice(i, i + Number(LIMIT)),
      rolesValues,
    ]);
    vaultsWithMembers.push(...batch);
  }

  const addressLower = address.toLowerCase();
  const vaultsByRole: Record<Address, string[]> = {};

  for (const { vault, owner, nodeOperator, members } of vaultsWithMembers) {
    const roles: string[] = [];

    if (owner.toLowerCase() === addressLower) {
      roles.push('Owner');
    }

    if (nodeOperator.toLowerCase() === addressLower) {
      roles.push('Node Operator');
    }

    const membersLength = Math.min(members.length, DASHBOARD_ROLES_KEYS.length);
    for (let i = 0; i < membersLength; i++) {
      const roleMembers = members[i];
      const roleName = DASHBOARD_ROLES_KEYS[i];

      const isHasRole =
        roleMembers &&
        roleMembers.some((member) => member.toLowerCase() === addressLower);

      if (isHasRole && roleName) roles.push(roleName);
    }

    if (roles.length > 0) vaultsByRole[vault] = roles;
  }

  return vaultsByRole;
};

export const getVaultsByRoleMember = async (role: Hex, member: Address) => {
  const contract = getVaultViewerContract();
  const vaults = await getAllVaults();
  const vaultsByRole: Address[] = [];

  for (let i = 0; i < vaults.length; i += Number(LIMIT)) {
    const vaults = await callReadMethodSilent(contract, 'vaultsByRoleBatch', [
      role,
      member,
      BigInt(i),
      BigInt(LIMIT),
    ]);
    vaultsByRole.push(...vaults);
  }

  return vaultsByRole;
};

export const getVaultsByOwner = async (address: Address) => {
  const contract = getVaultViewerContract();
  const totalVaults = await callReadMethodSilent(contract, 'vaultsCount');
  const vaultsByOwner: Address[] = [];

  for (let i = 0n; i < totalVaults; i += LIMIT) {
    const vaults = await callReadMethodSilent(contract, 'vaultsByOwnerBatch', [
      address,
      i,
      LIMIT,
    ]);
    vaultsByOwner.push(...vaults);
  }

  return vaultsByOwner;
};

export const chooseVault = async () => {
  const account = await getAccount();

  const vaultsByAddress = await getVaultsByAddress(account.address);

  if (Object.keys(vaultsByAddress).length === 0) {
    printError(
      new Error(`No vaults found for account ${account.address}`),
      'No vaults found for account. Please check your account address and try again.',
    );
  }

  const vaultsWithRole = Object.entries(vaultsByAddress).map(
    ([vault, roles]) => {
      return {
        title: `${vault} (${roles.join(', ')})`,
        value: vault,
      };
    },
  );

  const vault = await selectPrompt('Choose a vault', 'address', vaultsWithRole);

  if (!vault.address)
    printError(
      new Error('No vault selected'),
      'No vault selected. Please select a vault or use the --vault flag',
    );

  return vault.address;
};
