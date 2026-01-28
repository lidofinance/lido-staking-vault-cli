import { getContract, Address } from 'viem';
import { DistributorAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

export const getDistributorContract = async (address: Address) => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: DistributorAbi,
    client: publicClient,
  });
};

export type DistributorContract = ReturnType<typeof getDistributorContract>;
