import { getContract, Address, GetContractReturnType } from 'viem';
import { StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getStvStethPoolContract = async (
  address: Address,
): Promise<StvStethPoolContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: StvStETHPoolAbi,
    client: publicClient,
  });
};

export type StvStethPoolContract = GetContractReturnType<
  typeof StvStETHPoolAbi,
  RegisteredPublicClient
>;
