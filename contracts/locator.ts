import { getContract, GetContractReturnType } from 'viem';
import { LidoLocatorAbi } from 'abi';
import { getLocatorAddress } from 'configs';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export type LocatorContract = GetContractReturnType<
  typeof LidoLocatorAbi,
  RegisteredPublicClient
>;

export const getLocatorContract = async (): Promise<LocatorContract> => {
  const publicClient = await getPublicClient();
  const address = getLocatorAddress();

  return getContract({
    address,
    abi: LidoLocatorAbi,
    client: publicClient,
  });
};
