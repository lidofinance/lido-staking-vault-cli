import { getContract, Address, GetContractReturnType } from 'viem';
import { TimeLockAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export const getTimeLockContract = async (
  address: Address,
): Promise<TimeLockContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: TimeLockAbi,
    client: publicClient,
  });
};

export type TimeLockContract = GetContractReturnType<
  typeof TimeLockAbi,
  RegisteredPublicClient
>;
