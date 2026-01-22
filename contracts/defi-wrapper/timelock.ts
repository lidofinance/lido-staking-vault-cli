import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { TimeLockAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getTimeLockContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof TimeLockAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: TimeLockAbi,
    client: publicClient,
  });
};

export type TimeLockContract = Awaited<ReturnType<typeof getTimeLockContract>>;
