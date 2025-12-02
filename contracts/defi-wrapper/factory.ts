import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { FactoryAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getFactoryContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof FactoryAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: FactoryAbi,
    client: publicClient,
  });
};

export type FactoryContract = ReturnType<typeof getFactoryContract>;
