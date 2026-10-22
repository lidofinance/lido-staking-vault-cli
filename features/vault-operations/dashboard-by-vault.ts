import { Address, isAddressEqual, zeroAddress } from 'viem';
import { program } from 'command';

import {
  DashboardContract,
  getDashboardContract,
  getStakingVaultContract,
  StakingVaultContract,
  getVaultHubContract,
  isDashboard,
} from 'contracts';
import {
  callReadMethodSilent,
  confirmOperation,
  enterContractAddress,
  isJsonMode,
} from 'utils';
import { checkIsDisconnected } from 'features';

import { chooseVault } from './vaults-by-role.js';
import { verifyDashboardAddress } from './dashboard-address-check.js';

// Resolution probe only: a rejected read must not fail the resolution, so
// errors are swallowed on purpose. The authoritative check runs in
// `verifyDashboardAddress` below and surfaces failures to the user.
const safeIsDashboard = async (address: Address): Promise<boolean> => {
  try {
    return await isDashboard(address);
  } catch {
    return false;
  }
};

export const getDashboardByVault = async (vault: Address) => {
  const isDisconnected = await checkIsDisconnected(vault);

  if (isDisconnected) {
    // --json cannot prompt interactively, so fail closed instead
    if (isJsonMode() && !program.opts().yes) {
      throw new Error(
        'Vault is not connected to VaultHub. Use --yes to proceed in --json mode.',
      );
    }

    const confirm = await confirmOperation(
      'Vault is not connected to VaultHub. Do you want to continue executing the command?',
    );
    if (!confirm) {
      throw new Error('Vault is not connected to VaultHub');
    }
  }

  const vaultHub = await getVaultHubContract();
  const vaultContract = await getStakingVaultContract(vault);

  const [vaultConnection, vaultOwner] = await Promise.all([
    callReadMethodSilent({
      contract: vaultHub,
      methodName: 'vaultConnection',
      payload: [[vault]],
    }),
    callReadMethodSilent({
      contract: vaultContract,
      methodName: 'owner',
      payload: [],
    }),
  ]);

  // When connected, the Dashboard is the owner recorded by VaultHub; otherwise
  // it is the StakingVault's own owner.
  const supposedDashboardAddress = !isAddressEqual(
    vaultConnection.owner,
    zeroAddress,
  )
    ? vaultConnection.owner
    : vaultOwner;

  let dashboardAddress = supposedDashboardAddress;

  // After a voluntary disconnect the VaultHub holds the vault and hands it back
  // to the Dashboard via a 2-step transfer, so until `acceptOwnership` the
  // Dashboard is only the pending owner. Gated on the vault still being owned
  // by VaultHub, so it does not fire after `abandonDashboard` — there the
  // vault's owner is already the Dashboard itself.
  if (isDisconnected && isAddressEqual(vaultOwner, vaultHub.address)) {
    const supposedIsDashboard = await safeIsDashboard(supposedDashboardAddress);
    if (!supposedIsDashboard) {
      const pendingOwner = await callReadMethodSilent({
        contract: vaultContract,
        methodName: 'pendingOwner',
        payload: [],
      });

      if (
        !isAddressEqual(pendingOwner, zeroAddress) &&
        (await safeIsDashboard(pendingOwner))
      ) {
        dashboardAddress = pendingOwner;
      }
    }
  }

  await verifyDashboardAddress(dashboardAddress, vault);

  return dashboardAddress;
};

export const chooseVaultAndGetDashboard = async (args: {
  vault?: Address;
  isNotMember?: boolean;
}): Promise<{
  address: Address;
  contract: DashboardContract;
  vaultContract: StakingVaultContract;
  vault: Address;
}> => {
  const { vault, isNotMember = false } = args;
  const chosenVault: Address = isNotMember
    ? (vault ?? (await enterContractAddress('stVault')))
    : (vault ?? (await chooseVault()));

  const dashboard = await getDashboardByVault(chosenVault);
  const dashboardContract = await getDashboardContract(dashboard);
  const vaultContract = await getStakingVaultContract(chosenVault);

  return {
    address: dashboard,
    contract: dashboardContract,
    vaultContract,
    vault: chosenVault,
  };
};
