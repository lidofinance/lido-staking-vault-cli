import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StvPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getStvPoolContract = (
  address: Address,
): GetContractReturnType<typeof StvPoolAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: StvPoolAbi,
    client: getPublicClient(),
  });
};

export type StvPoolContract = ReturnType<typeof getStvPoolContract>;
