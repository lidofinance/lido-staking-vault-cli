import { getContract, GetContractReturnType } from 'viem';

import { LazyOracleAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export type LazyOracleContract = GetContractReturnType<
  typeof LazyOracleAbi,
  RegisteredPublicClient
>;

export const getLazyOracleContract = async (): Promise<LazyOracleContract> => {
  const publicClient = await getPublicClient();
  const locator = await getLocatorContract();
  const address = await locator.read.lazyOracle();

  return getContract({
    address,
    abi: LazyOracleAbi,
    client: publicClient,
  });
};
