import { getContract, Address, GetContractReturnType } from 'viem';
import { StrategyFactoryAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getStrategyFactoryContract = async (
  address: Address,
): Promise<StrategyFactoryContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: StrategyFactoryAbi,
    client: publicClient,
  });
};

export type StrategyFactoryContract = GetContractReturnType<
  typeof StrategyFactoryAbi,
  RegisteredPublicClient
>;
