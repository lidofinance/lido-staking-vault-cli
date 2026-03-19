import { getContract, Address, GetContractReturnType } from 'viem';
import { DistributorAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getDistributorContract = async (
  address: Address,
): Promise<DistributorContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: DistributorAbi,
    client: publicClient,
  });
};

export type DistributorContract = GetContractReturnType<
  typeof DistributorAbi,
  RegisteredPublicClient
>;
