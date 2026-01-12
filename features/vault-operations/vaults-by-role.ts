import { Address, Hex } from 'viem';

import {
  getVaultViewerContract,
  getDashboardImplContract,
  getPredepositGuaranteeContract,
} from 'contracts';
import {
  callReadMethodSilent,
  printError,
  selectPrompt,
  showSpinner,
  executeBatchedWithRateLimit,
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
const RATE_LIMIT_BATCH_SIZE = 120; // Max parallel requests per batch
const RATE_LIMIT_DELAY_MS = 500; // Delay between batches

/**
 * Get all vaults
 * @returns Address[] - Array of vault addresses
 */
export const getAllVaults = async () => {
  const hideSpinner = showSpinner({
    message: 'Getting vaults...',
  });

  try {
    const contract = await getVaultViewerContract();
    const totalVaults = await callReadMethodSilent({
      contract,
      methodName: 'vaultsCount',
      payload: [],
    });
    const vaultsByOwner: Address[] = [];

    for (let i = 0n; i < totalVaults; i += LIMIT) {
      const vaults = await callReadMethodSilent({
        contract,
        methodName: 'vaultAddressesBatch',
        payload: [[i, LIMIT]],
        withSpinner: false,
      });
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

/**
 * Get vaults by address
 * @param address - Address of the account
 * @returns Record<Address, string[]> - Map of vault addresses to roles
 */
export const getVaultsByAddress = async (
  address: Address,
): Promise<Record<Address, string[]>> => {
  const [contract, dashboardImpl, vaults, pdg] = await Promise.all([
    getVaultViewerContract(),
    getDashboardImplContract(),
    getAllVaults(),
    getPredepositGuaranteeContract(),
  ]);
  const vaultsWithMembers: VaultMembers[] = [];
  const addressLower = address.toLowerCase();
  const vaultsByRole: Record<Address, string[]> = {};

  // Get roles from dashboard impl with rate limiting
  const hideRolesSpinner = showSpinner({
    message: 'Getting roles...',
  });
  const rolesValues: Hex[] = await executeBatchedWithRateLimit(
    DASHBOARD_ROLES_KEYS,
    RATE_LIMIT_BATCH_SIZE,
    RATE_LIMIT_DELAY_MS,
    (key) => (dashboardImpl.read as any)[key](),
  );
  hideRolesSpinner();

  const hideMembersSpinner = showSpinner({
    message: 'Getting members...',
  });

  // Get roles and members from vaults (dashboard)
  for (let i = 0; i < vaults.length; i += Number(LIMIT)) {
    const batch = await callReadMethodSilent({
      contract,
      methodName: 'roleMembersBatch',
      payload: [[vaults.slice(i, i + Number(LIMIT)), rolesValues]],
      withSpinner: false,
    });
    vaultsWithMembers.push(...batch);
  }

  hideMembersSpinner();

  const hideDepositorsSpinner = showSpinner({
    message: 'Getting depositors...',
  });

  // Get depositors from pdg for node operators in vaults with rate limiting
  const nodeOperatorsAndVault = vaultsWithMembers.map(
    ({ nodeOperator, vault }) => ({ nodeOperator, vault }),
  );
  const depositorsWithVault = await executeBatchedWithRateLimit(
    nodeOperatorsAndVault,
    RATE_LIMIT_BATCH_SIZE,
    RATE_LIMIT_DELAY_MS,
    async ({ nodeOperator, vault }) => {
      const depositor = await callReadMethodSilent({
        contract: pdg,
        methodName: 'nodeOperatorDepositor',
        payload: [[nodeOperator]],
        withSpinner: false,
      });
      return { depositor, vault };
    },
  );
  hideDepositorsSpinner();

  for (const { depositor, vault } of depositorsWithVault) {
    if (depositor.toLowerCase() === addressLower) {
      vaultsByRole[vault] = ['Depositor'];
    }
  }

  // Map roles and members from vaults (dashboard)
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

    if (roles.length > 0)
      vaultsByRole[vault] = vaultsByRole[vault]
        ? [...vaultsByRole[vault], ...roles]
        : roles;
  }

  return vaultsByRole;
};

/**
 * Get vaults by role and member
 * @param role - Role to get vaults for
 * @param member - Member to get vaults for
 * @returns Address[] - Array of vault addresses
 */
export const getVaultsByRoleMember = async (role: Hex, member: Address) => {
  const contract = await getVaultViewerContract();
  const vaults = await getAllVaults();
  const vaultsByRole: Address[] = [];

  for (let i = 0; i < vaults.length; i += Number(LIMIT)) {
    const vaults = await callReadMethodSilent({
      contract,
      methodName: 'vaultsByRoleBatch',
      payload: [[role, member, BigInt(i), BigInt(LIMIT)]],
    });
    vaultsByRole.push(...vaults);
  }

  return vaultsByRole;
};

/**
 * Get vaults by owner
 * @param address - Address of the owner
 * @returns Address[] - Array of vault addresses
 */
export const getVaultsByOwner = async (address: Address) => {
  const contract = await getVaultViewerContract();
  const totalVaults = await callReadMethodSilent({
    contract,
    methodName: 'vaultsCount',
    payload: [],
  });
  const vaultsByOwner: Address[] = [];

  for (let i = 0n; i < totalVaults; i += LIMIT) {
    const vaults = await callReadMethodSilent({
      contract,
      methodName: 'vaultsByOwnerBatch',
      payload: [[address, i, LIMIT]],
    });
    vaultsByOwner.push(...vaults);
  }

  return vaultsByOwner;
};

/**
 * Choose a vault
 * @returns Address - Address of the chosen vault
 */
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
