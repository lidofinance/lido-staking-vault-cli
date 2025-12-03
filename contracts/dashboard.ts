import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { DashboardAbi } from 'abi';
import { getPublicClient } from 'providers';

export const getDashboardContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof DashboardAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: DashboardAbi,
    client: publicClient,
  });
};

export type DashboardContract = Awaited<
  ReturnType<typeof getDashboardContract>
>;
