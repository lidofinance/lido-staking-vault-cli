import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getStvStethPoolContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof StvStETHPoolAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: StvStETHPoolAbi,
    client: publicClient,
  });
};

export type StvStethPoolContract = ReturnType<typeof getStvStethPoolContract>;
