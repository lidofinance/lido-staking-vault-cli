import { getContract, createPublicClient, http, Address } from 'viem';
import { StakingVaultAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';

export const getStakingVaultContract = (address: Address) => {
  return getContract({
    address,
    abi: StakingVaultAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};
