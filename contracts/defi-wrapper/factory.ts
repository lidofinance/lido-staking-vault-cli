import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { FactoryAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getFactoryContract = (
  address: Address,
): GetContractReturnType<typeof FactoryAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: FactoryAbi,
    client: getPublicClient(),
  });
};

export type FactoryContract = ReturnType<typeof getFactoryContract>;
