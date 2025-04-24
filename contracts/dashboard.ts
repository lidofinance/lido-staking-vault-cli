import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { DashboardAbi } from 'abi';
import { getPublicClient } from 'providers';

export const getDashboardContract = (
  address: Address,
): GetContractReturnType<typeof DashboardAbi, WalletClient> => {
  return getContract({
    address: address,
    abi: DashboardAbi,
    client: getPublicClient(),
  });
};

export type DashboardContract = ReturnType<typeof getDashboardContract>;
