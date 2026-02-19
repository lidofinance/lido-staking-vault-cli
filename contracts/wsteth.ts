import { getContract, GetContractReturnType } from 'viem';
import { WstEthAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts';
import { RegisteredPublicClient, getPublicClient } from 'providers/index.js';

export type WstEthContract = GetContractReturnType<
  typeof WstEthAbi,
  RegisteredPublicClient
>;

export const getWstethContract = async (): Promise<WstEthContract> => {
  const publicClient = await getPublicClient();
  const locator = await getLocatorContract();

  const address = await locator.read.wstETH();

  return getContract({
    address: address,
    abi: WstEthAbi,
    client: publicClient,
  });
};
