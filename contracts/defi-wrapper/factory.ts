import { getContract, Address, GetContractReturnType } from 'viem';
import { FactoryAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getFactoryContract = async (
  address: Address,
): Promise<FactoryContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: FactoryAbi,
    client: publicClient,
  });
};

export type FactoryContract = GetContractReturnType<
  typeof FactoryAbi,
  RegisteredPublicClient
>;
