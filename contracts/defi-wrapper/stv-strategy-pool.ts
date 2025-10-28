import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StvStrategyPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getStvStrategyPoolContract = (
  address: Address,
): GetContractReturnType<typeof StvStrategyPoolAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: StvStrategyPoolAbi,
    client: getPublicClient(),
  });
};

export type StvStrategyPoolContract = ReturnType<
  typeof getStvStrategyPoolContract
>;
