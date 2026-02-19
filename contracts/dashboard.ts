import { getContract, Address, GetContractReturnType } from 'viem';
import { DashboardAbi } from 'abi';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getDashboardContract = async (
  address: Address,
): Promise<DashboardContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: DashboardAbi,
    client: publicClient,
  });
};

export type DashboardContract = Awaited<
  GetContractReturnType<typeof DashboardAbi, RegisteredPublicClient>
>;
