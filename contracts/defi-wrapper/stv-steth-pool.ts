import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getStvStethPoolContract = (
  address: Address,
): GetContractReturnType<typeof StvStETHPoolAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: StvStETHPoolAbi,
    client: getPublicClient(),
  });
};

export type StvStethPoolContract = ReturnType<typeof getStvStethPoolContract>;
