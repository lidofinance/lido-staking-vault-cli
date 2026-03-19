import { getContract, Address, GetContractReturnType } from 'viem';
import { StvPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getStvPoolContract = async (
  address: Address,
): Promise<StvPoolContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: StvPoolAbi,
    client: publicClient,
  });
};

export type StvPoolContract = GetContractReturnType<
  typeof StvPoolAbi,
  RegisteredPublicClient
>;
