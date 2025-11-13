import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { DistributorAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getDistributorContract = (
  address: Address,
): GetContractReturnType<typeof DistributorAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: DistributorAbi,
    client: getPublicClient(),
  });
};

export type DistributorContract = ReturnType<typeof getDistributorContract>;
