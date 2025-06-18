import { Address } from 'viem';

import {
  DashboardContract,
  getDashboardContract,
  getVaultHubContract,
} from 'contracts';
import { getPublicClient } from 'providers';
import { callReadMethodSilent } from 'utils';

import { chooseVault } from './vaults-by-owner.js';

export const getDashboardByVault = async (vault: Address) => {
  const vaultHub = await getVaultHubContract();
  const vaultConnection = await callReadMethodSilent(
    vaultHub,
    'vaultConnection',
    [vault],
  );

  const vaultOwner = vaultConnection.owner;
  const dashboard = getDashboardContract(vaultOwner);

  const publicClient = getPublicClient();
  const bytecode = await publicClient.getCode({ address: vaultOwner });

  if (!bytecode || bytecode === '0x') {
    throw new Error(`Owner ${vaultOwner} is not a contract (probably EOA)`);
  }

  return dashboard.address;
};

export const chooseVaultAndGetDashboard = async (
  vault?: Address,
): Promise<{ address: Address; contract: DashboardContract }> => {
  const chosenVault = vault ?? (await chooseVault());
  const dashboard = await getDashboardByVault(chosenVault);
  const dashboardContract = getDashboardContract(dashboard);

  return { address: dashboard, contract: dashboardContract };
};
