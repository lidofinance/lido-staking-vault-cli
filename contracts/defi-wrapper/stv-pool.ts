import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StvPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getStvPoolContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof StvPoolAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: StvPoolAbi,
    client: publicClient,
  });
};

export type StvPoolContract = Awaited<ReturnType<typeof getStvPoolContract>>;
