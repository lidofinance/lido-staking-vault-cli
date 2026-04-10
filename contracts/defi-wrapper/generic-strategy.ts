import { getContract, Address, GetContractReturnType } from 'viem';
import {
  GenericStrategyAbi,
  GenericStrategyAbiType,
} from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getGenericStrategyContract = async (
  address: Address,
): Promise<GenericStrategyContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: GenericStrategyAbi,
    client: publicClient,
  });
};

export type GenericStrategyContract = GetContractReturnType<
  GenericStrategyAbiType,
  RegisteredPublicClient
>;
