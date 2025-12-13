import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { DashboardAbi } from '../../../abi';
import { getClient, callReadMethodSilent } from '../providers';

export const getDashboardContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof DashboardAbi, WalletClient>> => {
  return getContract({
    address: address,
    abi: DashboardAbi,
    client: getClient(),
  });
};

export type DashboardContract = Awaited<
  ReturnType<typeof getDashboardContract>
>;

export const getLiabilityShares = async (dashboardAddress: Address) => {
  const contract = await getDashboardContract(dashboardAddress);
  return await callReadMethodSilent(contract, 'liabilityShares');
};

export const getTotalMintingCapacityShares = async (
  dashboardAddress: Address,
) => {
  const contract = await getDashboardContract(dashboardAddress);

  return await callReadMethodSilent(contract, 'totalMintingCapacityShares');
};
