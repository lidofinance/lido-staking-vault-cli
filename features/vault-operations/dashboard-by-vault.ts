import { Address } from 'viem';

import {
  DashboardContract,
  getDashboardContract,
  getStakingVaultContract,
  StakingVaultContract,
  getVaultHubContract,
} from 'contracts';
import { getPublicClient } from 'providers';
import { callReadMethodSilent, enterContractAddress } from 'utils';

import { chooseVault } from './vaults-by-role.js';

export const getDashboardByVault = async (vault: Address) => {
  const vaultHub = await getVaultHubContract();
  const vaultConnection = await callReadMethodSilent(
    vaultHub,
    'vaultConnection',
    [vault],
  );

  const vaultOwner = vaultConnection.owner;
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
