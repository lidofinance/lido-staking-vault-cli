import { Address } from 'viem';

import {
  DashboardContract,
  getDashboardContract,
  getStakingVaultContract,
  StakingVaultContract,
  getVaultHubContract,
} from 'contracts';
import { getPublicClient } from 'providers';
import {
  callReadMethodSilent,
  confirmOperation,
  enterContractAddress,
} from 'utils';
import { checkIsDisconnected } from 'features';

import { chooseVault } from './vaults-by-role.js';

export const getDashboardByVault = async (vault: Address) => {
  const isDisconnected = await checkIsDisconnected(vault);
  let vaultOwner: Address;

  if (isDisconnected) {
    const confirm = await confirmOperation(
      'Vault is not connected to VaultHub. Do you want to continue executing the command?',
    );
    if (!confirm) {
      throw new Error('Vault is not connected to VaultHub');
    }

    const vaultContract = await getStakingVaultContract(vault);
    vaultOwner = await callReadMethodSilent(vaultContract, 'owner');
  } else {
    const vaultHub = await getVaultHubContract();
    const vaultConnection = await callReadMethodSilent(
      vaultHub,
      'vaultConnection',
      [vault],
    );

    vaultOwner = vaultConnection.owner;
  }

  const dashboard = await getDashboardContract(vaultOwner);

  const publicClient = await getPublicClient();
  const bytecode = await publicClient.getCode({ address: vaultOwner });

  if (!bytecode || bytecode === '0x') {
    throw new Error(`Owner ${vaultOwner} is not a contract (probably EOA)`);
  }

  return dashboard.address;
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
  let chosenVault: Address;

  if (isNotMember) {
    chosenVault = vault ?? (await enterContractAddress('stVault'));
  } else {
    chosenVault = vault ?? (await chooseVault());
  }

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
