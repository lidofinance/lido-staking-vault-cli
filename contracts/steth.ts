import { getContract, GetContractReturnType } from 'viem';
import { StEthAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts/locator.js';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export const getStethContract = async (): Promise<StethContract> => {
  const locator = await getLocatorContract();
  const publicClient = await getPublicClient();
  const address = await locator.read.lido();

  return getContract({
    address,
    abi: StEthAbi,
    client: publicClient,
  });
};

export type StethContract = GetContractReturnType<
  typeof StEthAbi,
  RegisteredPublicClient
>;
